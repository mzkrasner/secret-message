import type { NextPage } from "next";
import { useEffect, useState } from "react";
import {
  _encryptWithLit,
  _decryptWithLit,
  encodeb64,
  decodeb64,
} from "../utils/lit";
import { useCeramicContext } from "../context";
import { PostProps } from "../types";
import Head from "next/head";
import Post from "../components/post.component";
import styles from "../styles/Home.module.scss";
import React from "react";
import * as LitJsSdk from "@lit-protocol/lit-node-client-nodejs";
import { checkAndSignAuthMessage } from "@lit-protocol/lit-node-client";
import { authenticateCeramic } from "../utils";
import { startLitClient } from "../utils/client";

type Profile = {
  [key: string]: any;
  id?: any;
  name?: string;
  username?: string;
  description?: string;
  gender?: string;
  emoji?: string;
};

const Home: NextPage = () => {
  const clients = useCeramicContext();
  const { ceramic, composeClient } = clients;
  const [newPost, setNewPost] = useState("");
  const [address, setAddress] = useState("");
  const [session, setSession] = useState("");
  const [loggedIn, setLoggedIn] = useState(false);
  const [account, setAccount] = useState("");
  const [loading, setLoading] = useState<boolean>(false);
  const [posts, setPosts] = useState<PostProps[] | []>([]);
  const [lit, setLit] = useState<any>();
  const [userLocation, setUserLocation] = useState(null);
  const chain = "ethereum";
  let alerted = false;

  async function isConnected() {
    const accounts = await window.ethereum.request({ method: "eth_accounts" });
    if (accounts.length) {
      console.log(`You're connected to: ${accounts[0]}`);
      setAccount(accounts[0].toLowerCase());
    } else {
      console.log("Metamask is not connected");
    }
  }

  const handleLogin = async () => {
    await authenticateCeramic(ceramic, composeClient);
    setLoggedIn(true);
    await getProfile();
    const thisLit = await startLitClient(window);
    setLit(thisLit);
    getPosts();
  };

  const getProfile = async () => {
    if (ceramic.did !== undefined) {
      const profile = await composeClient.executeQuery(`
        query {
          viewer {
            basicProfile {
              id
              name
              description
              gender
              emoji
            }
          }
        }
      `);
    }
  };

  const createPost = async () => {
    setLoading(true);
    if (!address || !newPost) {
      alert("You are missing a required entry field");
      setLoading(false);
      return;
    }
    if (!(address.length === 42)) {
      alert("Please enter a valid Eth address");
      setAddress("");
      setLoading(false);
      return;
    }
    const accessControlConditions = [
      {
        contractAddress: "",
        standardContractType: "",
        chain,
        method: "",
        parameters: [":userAddress"],
        returnValueTest: {
          comparator: "=",
          value: address,
        },
      },
    ];

    if (ceramic.did !== undefined) {
      const profile: Profile = await composeClient.executeQuery(`
        query {
          viewer {
            basicProfile {
              id
              name
            }
          }
        }
      `);
      if (
        profile &&
        profile.data?.viewer.basicProfile?.name &&
        address.length
      ) {
        const item = await _encryptWithLit(
          newPost,
          accessControlConditions,
          chain
        );
        const stringified = JSON.stringify(accessControlConditions);
        const b64 = new TextEncoder().encode(stringified);
        const encoded = await encodeb64(b64);
        const post = await composeClient.executeQuery(`
        mutation {
          createPosts(input: {
            content: {
              body: """${item[0]}"""
              to: "${address}"
              created: "${new Date().toISOString()}"
              profileId: "${profile.data.viewer.basicProfile.id}"
              symKey: "${item[1]}"
              chain: "${chain}"
              accessControlConditions: "${encoded}"
              accessControlConditionType: "accessControlConditions"
            }
          })
          {
            document {
              body
            }
          }
        }
      `);
        getPosts();
        setNewPost("");
        setAddress("");
        setLoading(false);
        alert("Created post.");
      } else {
        setLoading(false);
        alert(
          "Failed to fetch profile for authenticated user. Please register a profile."
        );
        window.location.href = "/profile";
      }
    }
  };
  const getPosts = async () => {
    const res: Res = await composeClient.executeQuery(`
      query {
        postsIndex (last:300) {
          edges {
            node {
              id
              body
              to
              created
              symKey
              chain
              accessControlConditions
              accessControlConditionType
              profile {
                id
                name
                username 
                emoji
              }
            }
          }
        }
      }
    `);
    const posts: PostProps[] = [];
    type Res = {
      [key: string]: any;
    };

    res.data.postsIndex.edges.map(
      (post: {
        node: {
          profile: { id: any; name: any; username: any; emoji: any };
          body: any;
          created: any;
          id: any;
          to: any;
          symKey: any;
          chain: any;
          accessControlConditions: any;
          accessControlConditionType: any;
        };
      }) => {
        if (post.node) {
          posts.push({
            author: {
              id: post.node.profile.id,
              name: post.node.profile.name,
              username: post.node.profile.username,
              emoji: post.node.profile.emoji,
            },
            post: {
              body: post.node.body,
              created: post.node.created,
              id: post.node.id,
              to: post.node.to,
              symKey: post.node.symKey,
              chain: post.node.chain,
              accessControlConditions: post.node.accessControlConditions,
              accessControlConditionType: post.node.accessControlConditionType,
            },
          });
        }
      }
    );
    // posts.sort((a, b) => {
    //   const date1: Date = new Date(b.post.created)
    //   const date2: Date = new Date(a.post.created)
    //   const returnVal: boolean = date1 < date2;
    //   return returnVal
    // })
    // // posts[0].post.created
    // // posts.sort((a,b)=> (new Date(b.post.created) - new Date(a.post.created)))
    if (posts.length == 0) {
      if (!alerted) {
        // alert(
        //   "There's nothing here! Try posting with a registered profile or see the README to upgrade to claynet to see other developer's posts."
        // );
        // window.location.href=('/profile')
        alerted = true;
      }
    }
    const items = posts.reverse();
    setPosts(items);
  };

  const getUserLocation = () => {
    // if geolocation is supported by the users browser

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(success, error);
    } else {
      console.log("Geolocation not supported");
    }

    function success(position: any) {
      const latitude = position.coords.latitude;
      const longitude = position.coords.longitude;
      setUserLocation({ latitude, longitude });
      console.log(`Latitude: ${latitude}, Longitude: ${longitude}`);
    }

    function error() {
      console.log("Unable to retrieve your location");
    }

    // if geolocation is not supported by the users browser
  };

  useEffect(() => {
    getUserLocation();
    if (localStorage.getItem("did")) {
      handleLogin();
    } else {
      setLoggedIn(false);
    }
  }, []);

  return (
    <div className={styles.homeContainer}>
      <Head>
        <title>Ceramic Social</title>
        {/* TODO: UPDATE FAVICON */}
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div style={{ display: "flex", justifyContent: "center" }}>
        <div>
          {userLocation && (
            <span className="text-primary font-medium text-base">
              Latitude: {userLocation.latitude}, Longitude:{" "}
              {userLocation.longitude}
            </span>
          )}
        </div>
        <button
          style={{
            width: "10rem",
            backgroundColor: "transparent",
            borderStyle: "groove",
            borderWidth: ".01rem",
            borderColor: "orange",
          }}
          onClick={() => {
            handleLogin();
          }}
        >
          Authenticate
        </button>
      </div>
    </div>
  );
};

export default Home;

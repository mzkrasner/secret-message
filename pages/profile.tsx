import { useState, useEffect } from "react";
import { authenticateCeramic } from "../utils";
import { useCeramicContext } from "../context";
import type { NextPage } from "next";
import Head from "next/head";
import styles from "../styles/Home.module.scss";

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
  const [loggedIn, setLoggedIn] = useState(false);
  const [profile, setProfile] = useState<Profile | undefined>();
  const [loading, setLoading] = useState<boolean>(false);

  const handleLogin = async () => {
    await authenticateCeramic(ceramic, composeClient);
    await getProfile();
  };

  const getProfile = async () => {
    setLoading(true);
    if (ceramic.did !== undefined) {
      const profile: Profile = await composeClient.executeQuery(`
        query {
          viewer {
            basicProfile {
              id
              name
              username
              description
              gender
              emoji
            }
          }
        }
      `);
      setProfile(profile?.data?.viewer?.basicProfile);
      setLoading(false);
    }
  };

  const updateProfile = async () => {
    setLoading(true);
    if(profile){
      if(profile.username){
        if(profile.username.length < 5){
          alert('Username must be greater than 5 characters');
          setLoading(false);
          return;
        }
      }
      
    }
    if (ceramic.did !== undefined) {
      const update = await composeClient.executeQuery(`
        mutation {
          createBasicProfile(input: {
            content: {
              name: "${profile?.name}"
              username: "${profile?.username}"
              description: "${profile?.description}"
              gender: "${profile?.gender}"
              emoji: "${profile?.emoji}"
            }
          }) 
          {
            document {
              name
              username
              description
              gender
              emoji
            }
          }
        }
      `);
      console.log(update)
      if (update.errors) {
        setLoading(false);
        alert(update.errors);
      } else {
        alert("Updated profile.");
        setLoading(false);
        const updatedProfile: Profile = await composeClient.executeQuery(`
        query {
          viewer {
            basicProfile {
              id
              name
              username
              description
              gender
              emoji
            }
          }
        }
      `);
        setProfile(updatedProfile?.data?.viewer?.basicProfile);
        const followSelf = await composeClient.executeQuery(`
        mutation {
          createFollowing(input: {
            content: {
              profileId: "${updatedProfile?.data?.viewer?.basicProfile.id}"
            }
          }) 
          {
            document {
              profileId
            }
          }
        }
      `);
        console.log(followSelf);
      }
      setLoading(false);
    }
  };

  useEffect(() => {
    if (localStorage.getItem("did")) {
      handleLogin();
    } else {
      setLoggedIn(false);
    }
  }, []);

  return (
    <div className={styles.homeContainer}>
      {profile === undefined && ceramic.did === undefined ? (
        <div  style={{ display: "flex", justifyContent: "center" }}>
          <button
            onClick={() => {
              handleLogin();
            }}
            style={{
              width: "5rem",
              backgroundColor: "transparent",
              borderStyle: "groove",
              borderWidth: ".01rem",
              borderColor: "orange",
            }}
          >
            Login
          </button>
        </div>
      ) : (
        <div
          style={{
            margin: "15rem auto",
            alignContent: "center",
            textAlign: "left",
          }}
        >
          <div style={{ width: "100%", height: "3rem", margin: "auto" }}>
            <label className="">Name</label>
            <input
              className=""
              type="text"
              style={{
                display: "inline-block",
                float: "right",
                width: "60%",
                backgroundColor: "#292828",
                color: "white",
              }}
              defaultValue={profile?.name || ""}
              onChange={(e) => {
                setProfile({ ...profile, name: e.target.value });
              }}
            />
          </div>
          <div style={{ width: "100%", height: "3rem" }}>
            <label>Username</label>
            <input
              style={{
                display: "inline-block",
                float: "right",
                width: "60%",
                backgroundColor: "#292828",
                color: "white",
              }}
              type="text"
              defaultValue={profile?.username || ""}
              onChange={(e) => {
                setProfile({ ...profile, username: e.target.value });
              }}
            />
          </div>
          <div style={{ width: "100%", height: "3rem" }}>
            <label>Description</label>
            <input
              style={{
                display: "inline-block",
                float: "right",
                width: "60%",
                backgroundColor: "#292828",
                color: "white",
              }}
              type="text"
              defaultValue={profile?.description || ""}
              onChange={(e) => {
                setProfile({ ...profile, description: e.target.value });
              }}
            />
          </div>
          <div style={{ width: "100%", height: "3rem" }}>
            <label>Gender</label>
            <input
              style={{
                display: "inline-block",
                float: "right",
                width: "60%",
                backgroundColor: "#292828",
                color: "white",
              }}
              type="text"
              defaultValue={profile?.gender || ""}
              onChange={(e) => {
                setProfile({ ...profile, gender: e.target.value });
              }}
            />
          </div>
          <div className="">
            <label>Emoji</label>
            <input
              style={{
                display: "inline-block",
                float: "right",
                width: "60%",
                backgroundColor: "#292828",
                color: "white",
              }}
              type="text"
              defaultValue={profile?.emoji || ""}
              onChange={(e) => {
                setProfile({ ...profile, emoji: e.target.value });
              }}
              maxLength={2}
            />
          </div>
          <br></br>
          <div style={{ display: "flex", justifyContent: "center" }}>
            <button
              onClick={() => {
                updateProfile();
              }}
              style={{
                width: "8rem",
                backgroundColor: "transparent",
                borderStyle: "groove",
                borderWidth: ".01rem",
                borderColor: "orange",
              }}
            >
              {loading ? "Loading..." : "Update Profile"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
export default Home;

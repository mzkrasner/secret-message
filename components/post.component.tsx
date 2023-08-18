import Link from "next/link";
import styles from "../styles/Home.module.scss";
import {
  _encryptWithLit,
  _decryptWithLit,
  encodeb64,
  decodeb64,
} from "../utils/lit";
import { PostProps } from "../types";
import { useEffect, useState } from "react";
import { EthereumWebAuth, getAccountId } from "@didtools/pkh-ethereum";
import { startLitClient } from "../utils/client";

const Post = ({ author, post }: PostProps) => {
  const chain = "ethereum";
  const [val, setVal] = useState<string | String>("");
  const [address, setAddress] = useState<string | String>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [decrypted, setDecrypted] = useState<boolean>(false);

  async function isConnected() {
    const accounts = await window.ethereum.request({ method: "eth_accounts" });
    if (accounts.length) {
      console.log(`You're connected to: ${accounts[0]}`);
      setAddress(accounts[0].toLowerCase());
    } else {
      console.log("Metamask is not connected");
    }
  }

  // const startLit = async () => {
  //   const client = new LitJsSdk.LitNodeClientNodeJs(window);
  //   await client.connect();
  // }

  const decode = async (post: any) => {
    setLoading(true);
    const encryptedMessage = await decodeb64(post.body);
    const symKey = await decodeb64(post.symKey);
    const accessControl = await decodeb64(post.accessControlConditions);
    const decoded = new TextDecoder().decode(accessControl);
    const accessControlConditionType = post.accessControlConditionType;
    const item = await _decryptWithLit(
      encryptedMessage,
      symKey,
      JSON.parse(decoded),
      chain
    );
    console.log(item);
    setVal(item);
    setLoading(false);
    setDecrypted(true);
    return item;
  };

  useEffect(() => {
    isConnected();
  }, []);
  return (
    <div
     
      key={post.id}
      style={{
        borderStyle: "inset",
        borderWidth: ".01rem",
        marginBottom: ".5rem",
        padding: ".5rem",
        position: "relative",
        width: '75%',
        margin: 'auto',
      }}
    >
      <div >
        <div style={{ textAlign: "left", marginBottom: "1rem" }}>
          <small>from: </small>
          {author.emoji} {author.name} <small>@{author.username}</small>
        </div>
      </div>
      <strong>
        {!val && (
          <div style={{ textAlign: "left", width: "100%" }}>{post.body}</div>
        )}
        {val && <div style={{ textAlign: "left", width: "75%" }}>{val}</div>}
      </strong>
      {/* <strong><div style={{"textAlign": "left"}}>{val ? val : ''}</div></strong> */}
      <br></br>
      <div style={{ fontStyle: "italic", fontSize: "12px", textAlign: "left" }}>
        to: {post.to}
      </div>
      {!decrypted && address === post.to.toLowerCase() && (
        <button
          style={{
            width: "5rem",
            backgroundColor: "transparent",
            borderStyle: "groove",
            borderWidth: ".01rem",
            borderColor: "orange",
          }}
          onClick={() => {
            decode(post);
          }}
        >
          {loading ? "Decrypting" : "Decrypt"}
        </button>
      )}
      <br></br>
    </div>
  );
};

export default Post;

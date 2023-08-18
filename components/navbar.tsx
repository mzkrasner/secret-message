/* eslint-disable @next/next/no-html-link-for-pages */

const Navbar = () => {
  return (
    <nav style={{width: "100vw", marginTop: "1rem"}}>
      <div style={{width: "100%", display: "flex", "justifyContent": "space-around"}}>
        <li style={{listStyleType: "none"}}>
          <a href="/">Home</a>
        </li>
        <p>Secret Message Board</p>
        <li style={{listStyleType: "none"}}>
          <a href="/profile">Profile</a>
        </li>
      </div>
    </nav>
  );
};

export default Navbar;

/* eslint-disable @next/next/no-html-link-for-pages */
export const Footer = () => {
  return (
    <footer className="footer">
     
        <div>
            <a href="/" onClick={() => {
                localStorage.removeItem('logged_in')
                window.location.href = "/";
            }}>
                Logout
            </a>
        </div>
    </footer>
  )
}
import React from "react";

const AuthLayout = ({ children, decorationPosition = "left", pageTitle = "StudyBuddy" }) => {
  React.useEffect(() => {
    document.title = pageTitle;
    return () => {
      document.title = "StudyBuddy";
    };
  }, [pageTitle]);

  return (
    <div className="auth-page-container">
      {decorationPosition === "left" ? (
        <>
          <div className="auth-decoration-circle top-20 left-10"></div>
          <div className="auth-decoration-circle bottom-20 right-10"></div>
        </>
      ) : (
        <>
          <div className="auth-decoration-circle top-20 right-10"></div>
          <div className="auth-decoration-circle bottom-20 left-10"></div>
        </>
      )}
      {children}
    </div>
  );
};

export default AuthLayout;
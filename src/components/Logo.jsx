function Logo({ sidebarOpen }) {
  return (
    <div className="startupLogo">
      <div className="startupLogoMark">
        <span className="orbit orbitOne"></span>
        <span className="orbit orbitTwo"></span>
        <span className="orbitDot dotOne"></span>
        <span className="orbitDot dotTwo"></span>
        <span className="orbitDot dotThree"></span>
        <span className="logoPointer"></span>
      </div>

      {sidebarOpen && <h1 className="startupLogoText">StartupCrew</h1>}
    </div>
  );
}

export default Logo;
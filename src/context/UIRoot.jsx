export default function UIRoot({ children }) {

  return (
    <div
      id="rivalis-ui-root"
      style={{
        position: "relative",
        width: "100%",
        minHeight: "100vh"
      }}
    >
      {children}
    </div>
  );
}

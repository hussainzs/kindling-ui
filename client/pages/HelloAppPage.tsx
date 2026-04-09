const styles = {
  screen: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100svh',
  },
  hello: {
    fontSize: '6rem',
    fontWeight: 700,
    color: '#111',
    margin: 0,
    fontFamily: "'Inter', sans-serif",
    textAlign: 'center' as const,
  },
} satisfies Record<string, React.CSSProperties>;

export default function HelloWorld() {
  return (
    <>
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Inter:wght@700&display=swap"
      />
      <div style={styles.screen}>
        <p style={styles.hello}>Hello world</p>
      </div>
    </>
  );
}

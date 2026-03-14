export const Unauthorized: React.FC = () => {
  return (
    <div id="error-page">
      <h1>Oops!</h1>
      <p>You are not an authorized user for this page!</p>
      <p>
        Return to{' '}
        <span style={{ color: 'blue' }}>
          <a href="/">home page</a>
        </span>
      </p>
    </div>
  );
};

export default Unauthorized;

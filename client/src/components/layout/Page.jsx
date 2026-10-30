

export const Page = ({ children, className = "" }) => {


  return (
    <>
      <main
        className={` relative min-h-svh flex justify-center ${className} `}
      >
        {children}
      </main>
      
    </>
  );
};

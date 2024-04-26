import { UserButton } from "@clerk/nextjs";

const Home = () => {
  return (
    <div>
      <h1>Dashboard</h1>
      <UserButton afterSignOutUrl="/" />
    </div>
  );
};

export default Home;

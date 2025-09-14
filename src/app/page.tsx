import HomePage from "./home";
import Header from "../components/Header";

export default function Home() {
  return (
    <>
      <Header defaultLanguage="FR" />
      <div className="lg:pt-0 pt-16">
        <HomePage />
      </div>
    </>
  );
}

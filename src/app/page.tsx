import Navbar from "@/components/Navbar";
import Index from "./Index/page";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      <main
        className={` h-full bg-blackBackground overflow-x-hidden font-tech`}
      >
        <div className="hidden font-tech h-1 bg-backgroundColor2 overflow-hidden w-screen bg-red-500"></div>

        <Index />
      </main>
    </>
  );
}

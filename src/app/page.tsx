import Index from "./Index/page";

export default function Home() {
  return (
    <>
      <main
        className={`h-full bg-blackBackground overflow-x-hidden font-tech `}
      >
        <div className="hidden font-tech h-1 bg-backgroundColor2 overflow-hidden w-screen "></div>
        <Index />
      </main>
    </>
  );
}

import Link from "next/link";
import PCModel from "./components/3dModels/PCModel";

export default function Home() {
  return (
   <div>
    <section className="h-[80vh] w-full">
      <PCModel />
    </section>
   </div>
  );
}

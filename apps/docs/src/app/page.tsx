import { SiteHeader } from "@/components/site-header";
import { TasksTableDemo } from "./_components/tasks-table";

export default function Home() {
  return (
    <div className="relative flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <section className="container mx-auto grid grid-cols-1 items-center gap-8 pt-6 pb-8 md:py-8">
          <TasksTableDemo />
        </section>
      </main>
    </div>
  );
}

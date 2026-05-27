import { Outlet } from "react-router-dom";

export default function AccountLayout() {
  return (
    <main className="min-h-screen bg-ds-bg px-4 pb-16 pt-[88px] font-sans text-ds-secondary antialiased md:px-6">
      <div className="mx-auto max-w-5xl">
        <Outlet />
      </div>
    </main>
  );
}

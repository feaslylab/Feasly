import ViewSwitch from '@/components/layout/ViewSwitch';

export default function Header() {
  return (
    <header className="border-b border-border bg-background">
      <div className="h-12 px-4 flex items-center gap-3">
        <div className="ml-auto flex items-center gap-3">
          <ViewSwitch />
        </div>
      </div>
    </header>
  );
}
type WorkflowPlaceholderPageProps = {
  title: string;
  code: string;
};

export default function WorkflowPlaceholderPage({
  title,
  code,
}: WorkflowPlaceholderPageProps) {
  return (
    <section className="card space-y-4">
      <p className="text-mini-header">{code}</p>
      <h1 className="text-section-header">{title}</h1>
      <p className="text-body">Placeholder page for UI implementation.</p>
    </section>
  );
}

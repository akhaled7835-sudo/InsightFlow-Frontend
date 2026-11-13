const companies = ['Northwind', 'Acme Corp', 'Lumen', 'Vertex', 'Cascade', 'Monarch']

export function Logos() {
  return (
    <section className="border-y border-border/60 py-12">
      <div className="mx-auto w-[min(1120px,calc(100%-1.5rem))]">
        <p className="text-center text-xs font-medium uppercase tracking-widest text-muted-foreground">
          Trusted by data teams at fast-growing companies
        </p>
        <div className="mt-8 grid grid-cols-2 items-center gap-x-8 gap-y-6 sm:grid-cols-3 lg:grid-cols-6">
          {companies.map((name) => (
            <div
              key={name}
              className="text-center text-lg font-semibold tracking-tight text-muted-foreground/70 transition-colors hover:text-foreground"
            >
              {name}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

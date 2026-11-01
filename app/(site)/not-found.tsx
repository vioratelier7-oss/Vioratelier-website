import { Monogram } from "@/components/brand/Logo";
import { ButtonLink } from "@/components/site/ui";

export default function NotFound() {
  return (
    <section className="flex min-h-[80vh] items-center pt-32">
      <div className="container-x flex flex-col items-center text-center">
        <Monogram className="h-16 w-auto text-stone" />
        <p className="eyebrow mt-10 text-champagne-deep">Error 404</p>
        <h1 className="display mt-6 text-[3rem] text-navy md:text-[4.5rem]">This page has <span className="italic">moved on.</span></h1>
        <p className="mt-6 max-w-md text-ink/70">The page you&apos;re looking for doesn&apos;t exist or is no longer published.</p>
        <div className="mt-10 flex flex-wrap justify-center gap-4"><ButtonLink href="/">Back to Home</ButtonLink><ButtonLink href="/work" variant="outline">View Work</ButtonLink></div>
      </div>
    </section>
  );
}

import { ButtonLink } from "@/components/ui/Button";
import { Wordmark } from "@/components/brand/Wordmark";

export default function NotFound() {
  return (
    <div className="container-narrow flex min-h-[60vh] flex-col items-center justify-center py-24 text-center">
      <Wordmark className="h-10 w-auto text-terracotta" decorative />
      <h1 className="display-tight mt-9 text-4xl text-charcoal md:text-5xl">
        This one has sold out
      </h1>
      <p className="mt-5 max-w-md text-lg text-sand-700">
        Or it never existed. Either way, the page you were looking for is not
        here — but today&rsquo;s batch is.
      </p>
      <div className="mt-9 flex flex-wrap justify-center gap-3">
        <ButtonLink href="/shop" size="lg">
          see today&rsquo;s batch
        </ButtonLink>
        <ButtonLink href="/" size="lg" variant="secondary">
          back home
        </ButtonLink>
      </div>
    </div>
  );
}

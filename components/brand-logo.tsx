import Image from 'next/image';

export function BrandLogo({ priority = false }: { priority?: boolean }) {
  return <Image src="/images/logo-vovo-tereza.png" alt="Vovó Tereza" width={1672} height={941} className="brand-logo" priority={priority} />;
}

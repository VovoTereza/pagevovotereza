'use client';

import Image from 'next/image';
import {
  BookOpen,
  Check,
  Download,
  ImagePlus,
  LockKeyhole,
  Plus,
  Smartphone,
} from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  formatMoney,
  type Bundle,
  type Product,
  type Testimonial,
} from '@/lib/catalog';
import { PaymentIcon } from './payment-icons';

export function PaymentMethods() {
  return (
    <div className="payment-methods">
      <p className="payment-security">
        <LockKeyhole aria-hidden="true" /> Pagamento protegido por{' '}
        <Image
          src="/images/payments/stripe.svg"
          alt="Stripe"
          width={44}
          height={19}
          unoptimized
          className="payment-provider-logo"
        />
      </p>
      <ul
        className="payment-badges"
        aria-label="Formas de pagamento compatíveis com a Stripe, sujeitas à disponibilidade no checkout"
      >
        <li>
          <PaymentIcon kind="card" />
          <span className="sr-only">Cartão</span>
        </li>
        <li>
          <PaymentIcon kind="wallet" />
          <span className="sr-only">Carteira digital</span>
        </li>
      </ul>
      <small>As opções disponíveis são confirmadas no checkout.</small>
    </div>
  );
}

const customerStories: { src: string; alt: string }[] = [];

export function CustomerStories({
  compact = false,
  stories = customerStories,
}: {
  compact?: boolean;
  stories?: { src: string; alt: string }[];
}) {
  const emptySlots = Array.from(
    { length: compact ? 4 : 5 },
    (_, index) => index,
  );
  const titleId = compact
    ? 'cart-customer-stories-title'
    : 'customer-stories-title';
  return (
    <section
      className={`customer-stories${compact ? ' compact' : ''}`}
      aria-labelledby={titleId}
      data-editor-field="gallery"
    >
      <div className="customer-stories-heading">
        <p className="eyebrow">MULHERES REAIS, ROTINAS REAIS</p>
        <h3 id={titleId}>
          {compact
            ? 'Quem escolheu os cadernos'
            : 'Quem escolheu levar os cadernos para casa'}
        </h3>
      </div>
      <div className="customer-stories-rail">
        <div className="customer-stories-track">
          {[false, true].map((isDuplicate) => (
            <div
              className="customer-stories-group"
              aria-hidden={isDuplicate || undefined}
              key={isDuplicate ? 'duplicate' : 'original'}
            >
              {stories.length > 0
                ? stories.map((story) => (
                    <figure
                      className="customer-story"
                      key={`${isDuplicate ? 'duplicate' : 'original'}-${story.src}`}
                    >
                      <Image
                        src={story.src}
                        alt={isDuplicate ? '' : story.alt}
                        fill
                        sizes="(max-width: 600px) 44vw, 180px"
                      />
                    </figure>
                  ))
                : emptySlots.map((slot) => (
                    <div
                      className="customer-story customer-story-placeholder"
                      key={slot}
                      aria-label="Espaço reservado para foto autorizada de cliente"
                    >
                      <ImagePlus aria-hidden="true" />
                      <span>Foto autorizada</span>
                    </div>
                  ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function BundleSelector({
  bundles,
  products,
  testimonials = [],
  customerPhotos = [],
  value,
  onChange,
  onBuy,
}: {
  bundles: Bundle[];
  products: Product[];
  testimonials?: Testimonial[];
  customerPhotos?: { id: string; src: string; alt: string }[];
  value: string;
  onChange: (value: string) => void;
  onBuy: () => void;
}) {
  const chosen = bundles.find((item) => item.id === value) || bundles[0]!;
  const getProduct = (id: string) => products.find((item) => item.id === id);
  return (
    <div className="collection-picker">
      <div className="collection-intro">
        <p className="eyebrow">OS CADERNOS DA VOVÓ TEREZA</p>
        <h2 id="collection-heading">Escolha como quer começar seu cuidado.</h2>
        <p className="collection-subtitle">
          Pagamento único, acesso digital e conteúdo organizado para consultar
          quando precisar.
        </p>
        <div className="collection-price" aria-live="polite" aria-atomic="true">
          {chosen.compareAtPrice > chosen.price && (
            <del aria-label="Soma dos preços avulsos">
              {formatMoney(chosen.compareAtPrice)}
            </del>
          )}
          <strong>{formatMoney(chosen.price)}</strong>
          {chosen.compareAtPrice > chosen.price && (
            <span>
              ECONOMIZE {formatMoney(chosen.compareAtPrice - chosen.price)} EM
              RELAÇÃO AOS AVULSOS
            </span>
          )}
        </div>
        <ul className="collection-benefits" aria-label="Benefícios da coleção">
          <li>
            <Check aria-hidden="true" />
            150 receitas organizadas
          </li>
          <li>
            <BookOpen aria-hidden="true" />
            Passo a passo simples
          </li>
          <li>
            <Smartphone aria-hidden="true" />
            Leia no celular
          </li>
          <li>
            <Download aria-hidden="true" />
            Arquivos para baixar
          </li>
        </ul>
      </div>
      <RadioGroup
        className="collection-options"
        value={value}
        onValueChange={onChange}
        aria-labelledby="collection-heading"
      >
        {bundles.map((bundle) => {
          const selected = bundle.id === value;
          return (
            <div
              key={bundle.id}
              className={`collection-option${selected ? ' is-selected' : ''}`}
            >
              <label
                className="collection-option-header"
                htmlFor={`collection-${bundle.id}`}
              >
                <RadioGroupItem
                  value={bundle.id}
                  id={`collection-${bundle.id}`}
                  className="collection-radio"
                  aria-describedby={`collection-description-${bundle.id}`}
                />
                <span className="collection-option-copy">
                  <span className="collection-option-title">
                    {bundle.name}
                    {bundle.badge && (
                      <span className="collection-option-badge">
                        {bundle.recommended ? 'RECOMENDADO' : bundle.badge}
                      </span>
                    )}
                  </span>
                  <span
                    className="collection-option-description"
                    id={`collection-description-${bundle.id}`}
                  >
                    {bundle.productIds.length === 1
                      ? 'O livro principal. Acesso digital após confirmação.'
                      : `${bundle.productIds.length} cadernos · economize ${Math.round((1 - bundle.price / bundle.compareAtPrice) * 100)}% na coleção`}
                  </span>
                </span>
                <span className="collection-option-price">
                  <strong>{formatMoney(bundle.price)}</strong>
                  {bundle.compareAtPrice > bundle.price && (
                    <del aria-label="Soma dos preços avulsos">
                      {formatMoney(bundle.compareAtPrice)}
                    </del>
                  )}
                </span>
              </label>
              {selected && (
                <div className="collection-expanded">
                  <div className="collection-items-heading">
                    <span>O QUE VOCÊ RECEBE</span>
                    <span>VALOR AVULSO</span>
                  </div>
                  <ul className="collection-items">
                    {bundle.productIds.map((id, index) => {
                      const product = getProduct(id);
                      if (!product) return null;
                      return (
                        <li key={id} className="collection-item">
                          <div className="collection-thumbnail">
                            <Image
                              src={
                                product.coverImage ||
                                '/images/vovo-tereza-caderno-v2.png'
                              }
                              alt=""
                              width={54}
                              height={70}
                              unoptimized={Boolean(product.coverImage)}
                            />
                            <span aria-hidden="true">
                              {String(index + 1).padStart(2, '0')}
                            </span>
                          </div>
                          <div className="collection-item-copy">
                            <strong>{product.name}</strong>
                            <small>{product.category} · Vovó Tereza</small>
                          </div>
                          <span className="collection-item-value">
                            {formatMoney(product.price)}
                          </span>
                          {index < bundle.productIds.length - 1 && (
                            <span
                              className="collection-plus"
                              aria-hidden="true"
                            >
                              <Plus />
                            </span>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                  <div className="collection-included">
                    <span className="collection-included-check">
                      <Check aria-hidden="true" />
                    </span>
                    <span>
                      Todos os{' '}
                      {bundle.productIds.length === 1
                        ? 'preparos reunidos em um caderno digital'
                        : `${bundle.productIds.length} cadernos incluídos nesta coleção`}
                    </span>
                    <BookOpen aria-hidden="true" />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </RadioGroup>
      <div className="collection-purchase">
        <p className="collection-selection">
          <Check aria-hidden="true" />
          <span>
            <strong>{chosen.name}</strong> selecionado · pagamento único
          </span>
        </p>
        <button
          type="button"
          className="primary-button collection-buy"
          data-purchase-cta
          onClick={onBuy}
        >
          APROVEITAR OFERTA <span>{formatMoney(chosen.price)}</span>
        </button>
        <PaymentMethods />
        <CustomerStories
          stories={[
            ...customerPhotos.map((item) => ({ src: item.src, alt: item.alt })),
            ...testimonials
              .filter((item) => item.active && item.photo)
              .map((item) => ({
                src: item.photo!,
                alt: `${item.name}${item.city ? `, ${item.city}` : ''}`,
              })),
          ]}
        />
      </div>
    </div>
  );
}

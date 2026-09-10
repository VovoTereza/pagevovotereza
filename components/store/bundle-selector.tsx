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

export function PaymentMethods({
  note = 'As opções disponíveis são confirmadas no checkout.',
  securityText = 'Pagamento protegido por',
}: {
  note?: string;
  securityText?: string;
}) {
  return (
    <div className="payment-methods">
      <p className="payment-security">
        <LockKeyhole aria-hidden="true" /> {securityText}{' '}
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
      <small>{note}</small>
    </div>
  );
}

const customerStories: { src: string; alt: string }[] = [];

export function CustomerStories({
  compact = false,
  stories = customerStories,
  eyebrow = 'MULHERES REAIS, ROTINAS REAIS',
  title = 'Quem escolheu levar os cadernos para casa',
  compactTitle = 'Quem escolheu os cadernos',
}: {
  compact?: boolean;
  stories?: { src: string; alt: string }[];
  eyebrow?: string;
  title?: string;
  compactTitle?: string;
}) {
  const emptySlots = Array.from(
    { length: compact ? 4 : 5 },
    (_, index) => index,
  );
  const uniqueStories = Array.from(
    new Map(
      stories
        .filter((story) => story.src.trim())
        .map((story) => [story.src.trim(), story]),
    ).values(),
  );
  const shouldLoop = uniqueStories.length > 1;
  const titleId = compact
    ? 'cart-customer-stories-title'
    : 'customer-stories-title';
  return (
    <section
      className={`customer-stories${compact ? ' compact' : ''}${shouldLoop ? ' is-looping' : ''}`}
      aria-labelledby={titleId}
    >
      <div className="customer-stories-heading" data-editor-field="galleryCopy">
        <p className="eyebrow">{eyebrow}</p>
        <h3 id={titleId}>{compact ? compactTitle : title}</h3>
      </div>
      <div className="customer-stories-rail" data-editor-field="gallery">
        <div className="customer-stories-track">
          {(shouldLoop ? [false, true] : [false]).map((isLoopCopy) => (
            <div
              className="customer-stories-group"
              aria-hidden={isLoopCopy || undefined}
              key={isLoopCopy ? 'loop-copy' : 'stories'}
            >
              {uniqueStories.length > 0
                ? uniqueStories.map((story) => (
                    <figure
                      className="customer-story"
                      key={`${isLoopCopy ? 'copy' : 'story'}-${story.src}`}
                    >
                      <Image
                        src={story.src}
                        alt={isLoopCopy ? '' : story.alt}
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
  content,
}: {
  bundles: Bundle[];
  products: Product[];
  testimonials?: Testimonial[];
  customerPhotos?: { id: string; src: string; alt: string }[];
  value: string;
  onChange: (value: string) => void;
  onBuy: () => void;
  content: {
    collectionEyebrow: string;
    collectionTitle: string;
    collectionSubtitle: string;
    collectionBenefits: string[];
    collectionCtaText: string;
    paymentNote: string;
    paymentSecurityText: string;
    galleryEyebrow: string;
    galleryTitle: string;
    cartGalleryTitle: string;
  };
}) {
  const chosen = bundles.find((item) => item.id === value) || bundles[0]!;
  const getProduct = (id: string) => products.find((item) => item.id === id);
  return (
    <div className="collection-picker">
      <div className="collection-intro" data-editor-field="collectionHeading">
        <p className="eyebrow">{content.collectionEyebrow}</p>
        <h2 id="collection-heading">{content.collectionTitle}</h2>
        <p className="collection-subtitle">{content.collectionSubtitle}</p>
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
        <ul
          className="collection-benefits"
          aria-label="Benefícios da coleção"
          data-editor-field="collectionBenefits"
        >
          <li>
            <Check aria-hidden="true" />
            {content.collectionBenefits[0]}
          </li>
          <li>
            <BookOpen aria-hidden="true" />
            {content.collectionBenefits[1]}
          </li>
          <li>
            <Smartphone aria-hidden="true" />
            {content.collectionBenefits[2]}
          </li>
          <li>
            <Download aria-hidden="true" />
            {content.collectionBenefits[3]}
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
                                '/images/vovo-tereza-caderno-v2.jpg'
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
          {content.collectionCtaText} <span>{formatMoney(chosen.price)}</span>
        </button>
        <PaymentMethods
          note={content.paymentNote}
          securityText={content.paymentSecurityText}
        />
        <CustomerStories
          eyebrow={content.galleryEyebrow}
          title={content.galleryTitle}
          compactTitle={content.cartGalleryTitle}
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

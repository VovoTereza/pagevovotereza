'use client';

import Image from 'next/image';
import { BookOpen, Check, Download, LockKeyhole, Plus, Smartphone } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { bundles, formatMoney, getBundle, getProduct } from '@/lib/catalog';

export function PaymentMethods() {
  return (
    <div className="payment-methods">
      <p className="payment-security"><LockKeyhole aria-hidden="true" /> Pagamento protegido por <Image src="/images/payments/stripe.svg" alt="Stripe" width={44} height={19} unoptimized className="payment-provider-logo" /></p>
      <ul className="payment-badges" aria-label="Formas de pagamento compatíveis com a Stripe, sujeitas à disponibilidade no checkout">
        {[
          ['visa', 'Visa'],
          ['mastercard', 'Mastercard'],
          ['american-express', 'American Express'],
          ['apple-pay', 'Apple Pay'],
          ['google-pay', 'Google Pay'],
        ].map(([slug, name]) => (
          <li key={slug} className={`payment-brand payment-brand-${slug}`}>
            <Image src={`/images/payments/${slug}.svg`} alt={name} width={44} height={44} unoptimized />
          </li>
        ))}
      </ul>
      <small>As opções disponíveis são confirmadas no checkout.</small>
    </div>
  );
}

export function BundleSelector({ value, onChange, onBuy }: {
  value: string;
  onChange: (value: string) => void;
  onBuy: () => void;
}) {
  const chosen = getBundle(value)!;
  return (
    <div className="collection-picker">
      <div className="collection-intro">
        <p className="eyebrow">OS CADERNOS DA VOVÓ TEREZA</p>
        <h2 id="collection-heading">Receitas de família, para guardar e fazer de novo.</h2>
        <p className="collection-subtitle">Escolha o caderno que combina com a sua cozinha.</p>
        <div className="collection-price" aria-live="polite" aria-atomic="true">
          {chosen.compareAtPrice > chosen.price && <del aria-label="Soma dos preços avulsos">{formatMoney(chosen.compareAtPrice)}</del>}
          <strong>{formatMoney(chosen.price)}</strong>
          {chosen.compareAtPrice > chosen.price && <span>ECONOMIZE {formatMoney(chosen.compareAtPrice - chosen.price)} EM RELAÇÃO AOS AVULSOS</span>}
        </div>
        <ul className="collection-benefits" aria-label="Benefícios da coleção">
          <li><Check aria-hidden="true"/>Receitas organizadas</li>
          <li><BookOpen aria-hidden="true"/>Passo a passo simples</li>
          <li><Smartphone aria-hidden="true"/>Leia no celular</li>
          <li><Download aria-hidden="true"/>Arquivos para baixar</li>
        </ul>
      </div>
      <RadioGroup className="collection-options" value={value} onValueChange={onChange} aria-labelledby="collection-heading">
        {bundles.map((bundle) => {
          const selected = bundle.id === value;
          return (
            <div key={bundle.id} className={`collection-option${selected ? ' is-selected' : ''}`}>
              <label className="collection-option-header" htmlFor={`collection-${bundle.id}`}>
                <RadioGroupItem value={bundle.id} id={`collection-${bundle.id}`} className="collection-radio" aria-describedby={`collection-description-${bundle.id}`} />
                <span className="collection-option-copy">
                  <span className="collection-option-title">{bundle.name}{bundle.badge && <span className="collection-option-badge">{bundle.recommended ? 'RECOMENDADO' : bundle.badge}</span>}</span>
                  <span className="collection-option-description" id={`collection-description-${bundle.id}`}>{bundle.productIds.length === 1 ? 'O livro principal. Acesso digital após confirmação.' : `${bundle.productIds.length} cadernos · economize ${Math.round((1 - bundle.price / bundle.compareAtPrice) * 100)}% na coleção`}</span>
                </span>
                  <span className="collection-option-price"><strong>{formatMoney(bundle.price)}</strong>{bundle.compareAtPrice > bundle.price && <del aria-label="Soma dos preços avulsos">{formatMoney(bundle.compareAtPrice)}</del>}</span>
              </label>
              {selected && (
                <div className="collection-expanded">
                  <div className="collection-items-heading"><span>O QUE VOCÊ RECEBE</span><span>VALOR AVULSO</span></div>
                  <ul className="collection-items">
                    {bundle.productIds.map((id, index) => {
                      const product = getProduct(id)!;
                      return (
                        <li key={id} className="collection-item">
                          <div className="collection-thumbnail"><Image src="/images/hero-vovo-tereza.png" alt="" width={54} height={70} /><span aria-hidden="true">{String(index + 1).padStart(2, '0')}</span></div>
                          <div className="collection-item-copy"><strong>{product.name}</strong><small>{product.category} · Vovó Tereza</small></div>
                          <span className="collection-item-value">{formatMoney(product.price)}</span>
                          {index < bundle.productIds.length - 1 && <span className="collection-plus" aria-hidden="true"><Plus /></span>}
                        </li>
                      );
                    })}
                  </ul>
                  <div className="collection-included"><span className="collection-included-check"><Check aria-hidden="true"/></span><span>Todos os {bundle.productIds.length === 1 ? 'preparos reunidos em um caderno digital' : `${bundle.productIds.length} cadernos incluídos nesta coleção`}</span><BookOpen aria-hidden="true"/></div>
                </div>
              )}
            </div>
          );
        })}
      </RadioGroup>
      <div className="collection-purchase">
        <p className="collection-selection"><Check aria-hidden="true"/><span><strong>{chosen.name}</strong> selecionado · pagamento único</span></p>
        <button type="button" className="primary-button collection-buy" onClick={onBuy}>APROVEITAR OFERTA <span>{formatMoney(chosen.price)}</span></button>
        <PaymentMethods />
      </div>
    </div>
  );
}

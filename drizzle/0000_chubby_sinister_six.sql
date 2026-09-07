CREATE TABLE `admin_users` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`password_hash` text NOT NULL,
	`name` text NOT NULL,
	`active` integer DEFAULT true NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `admin_users_email_unique` ON `admin_users` (`email`);--> statement-breakpoint
CREATE TABLE `analytics_events` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`session_id` text,
	`order_id` text,
	`payload` text,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `bonuses` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`description` text NOT NULL,
	`product_id` text,
	`value` integer,
	`active` integer DEFAULT true NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `bundle_items` (
	`bundle_id` text NOT NULL,
	`product_id` text NOT NULL,
	`quantity` integer DEFAULT 1 NOT NULL,
	`sort_order` integer DEFAULT 0 NOT NULL,
	PRIMARY KEY(`bundle_id`, `product_id`),
	FOREIGN KEY (`bundle_id`) REFERENCES `bundles`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `bundles` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`internal_name` text NOT NULL,
	`slug` text NOT NULL,
	`short_description` text,
	`description` text NOT NULL,
	`image` text,
	`mobile_image` text,
	`price` integer NOT NULL,
	`compare_at_price` integer,
	`currency` text DEFAULT 'BRL' NOT NULL,
	`badge_text` text,
	`cta_text` text NOT NULL,
	`recommended` integer DEFAULT false NOT NULL,
	`default_selected` integer DEFAULT false NOT NULL,
	`active` integer DEFAULT true NOT NULL,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`start_date` integer,
	`end_date` integer,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `bundles_slug_unique` ON `bundles` (`slug`);--> statement-breakpoint
CREATE TABLE `cart_offers` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`internal_name` text NOT NULL,
	`headline` text NOT NULL,
	`description` text NOT NULL,
	`product_id` text NOT NULL,
	`image` text,
	`price_override` integer,
	`cta_text` text NOT NULL,
	`conditions` text,
	`active` integer DEFAULT true NOT NULL,
	`priority` integer DEFAULT 0 NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `digital_assets` (
	`id` text PRIMARY KEY NOT NULL,
	`product_id` text NOT NULL,
	`file_key` text NOT NULL,
	`file_name` text NOT NULL,
	`content_type` text NOT NULL,
	`active` integer DEFAULT true NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `exit_offers` (
	`id` text PRIMARY KEY NOT NULL,
	`stage` integer NOT NULL,
	`name` text NOT NULL,
	`internal_name` text NOT NULL,
	`headline` text NOT NULL,
	`subheadline` text,
	`description` text NOT NULL,
	`image` text,
	`offer_type` text NOT NULL,
	`product_id` text,
	`bundle_id` text,
	`discount_type` text,
	`discount_value` integer,
	`bonus_id` text,
	`cta_text` text NOT NULL,
	`secondary_text` text,
	`active` integer DEFAULT true NOT NULL,
	`start_date` integer,
	`end_date` integer,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`bundle_id`) REFERENCES `bundles`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`bonus_id`) REFERENCES `bonuses`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `exit_offers_stage_unique` ON `exit_offers` (`stage`);--> statement-breakpoint
CREATE TABLE `faqs` (
	`id` text PRIMARY KEY NOT NULL,
	`question` text NOT NULL,
	`answer` text NOT NULL,
	`active` integer DEFAULT true NOT NULL,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `keywords` (
	`id` text PRIMARY KEY NOT NULL,
	`keyword` text NOT NULL,
	`category` text NOT NULL,
	`priority` integer DEFAULT 0 NOT NULL,
	`intent` text NOT NULL,
	`pages` text,
	`active` integer DEFAULT true NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `keywords_keyword_unique` ON `keywords` (`keyword`);--> statement-breakpoint
CREATE TABLE `order_bumps` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`internal_name` text NOT NULL,
	`headline` text NOT NULL,
	`description` text NOT NULL,
	`product_id` text NOT NULL,
	`price_override` integer,
	`image` text,
	`badge_text` text,
	`cta_text` text NOT NULL,
	`location` text DEFAULT 'cart' NOT NULL,
	`conditions` text,
	`active` integer DEFAULT true NOT NULL,
	`priority` integer DEFAULT 0 NOT NULL,
	`start_date` integer,
	`end_date` integer,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `order_items` (
	`id` text PRIMARY KEY NOT NULL,
	`order_id` text NOT NULL,
	`product_id` text,
	`bundle_id` text,
	`title_snapshot` text NOT NULL,
	`quantity` integer DEFAULT 1 NOT NULL,
	`unit_price` integer NOT NULL,
	`total` integer NOT NULL,
	`item_type` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`bundle_id`) REFERENCES `bundles`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `orders` (
	`id` text PRIMARY KEY NOT NULL,
	`order_number` text NOT NULL,
	`customer_name` text,
	`customer_email` text,
	`status` text DEFAULT 'pending' NOT NULL,
	`payment_status` text DEFAULT 'pending' NOT NULL,
	`subtotal` integer NOT NULL,
	`discount` integer DEFAULT 0 NOT NULL,
	`total` integer NOT NULL,
	`currency` text DEFAULT 'BRL' NOT NULL,
	`stripe_payment_intent_id` text,
	`stripe_checkout_session_id` text,
	`stripe_customer_id` text,
	`download_token` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `orders_order_number_unique` ON `orders` (`order_number`);--> statement-breakpoint
CREATE UNIQUE INDEX `orders_stripe_payment_intent_id_unique` ON `orders` (`stripe_payment_intent_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `orders_stripe_checkout_session_id_unique` ON `orders` (`stripe_checkout_session_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `orders_download_token_unique` ON `orders` (`download_token`);--> statement-breakpoint
CREATE TABLE `pixel_integrations` (
	`id` text PRIMARY KEY NOT NULL,
	`provider` text NOT NULL,
	`public_id` text,
	`active` integer DEFAULT false NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `pixel_integrations_provider_unique` ON `pixel_integrations` (`provider`);--> statement-breakpoint
CREATE TABLE `processed_webhooks` (
	`id` text PRIMARY KEY NOT NULL,
	`type` text NOT NULL,
	`processed_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `product_categories` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`slug` text NOT NULL,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`active` integer DEFAULT true NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `product_categories_slug_unique` ON `product_categories` (`slug`);--> statement-breakpoint
CREATE TABLE `product_images` (
	`id` text PRIMARY KEY NOT NULL,
	`product_id` text NOT NULL,
	`url` text NOT NULL,
	`alt` text NOT NULL,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `products` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`slug` text NOT NULL,
	`internal_name` text NOT NULL,
	`short_description` text,
	`description` text NOT NULL,
	`price` integer NOT NULL,
	`compare_at_price` integer,
	`currency` text DEFAULT 'BRL' NOT NULL,
	`active` integer DEFAULT true NOT NULL,
	`featured` integer DEFAULT false NOT NULL,
	`cover_image` text,
	`mobile_image` text,
	`delivery_type` text DEFAULT 'digital' NOT NULL,
	`digital_file` text,
	`category_id` text,
	`seo_title` text,
	`seo_description` text,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`category_id`) REFERENCES `product_categories`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `products_slug_unique` ON `products` (`slug`);--> statement-breakpoint
CREATE TABLE `promotions` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`code` text,
	`discount_type` text NOT NULL,
	`discount_value` integer NOT NULL,
	`conditions` text,
	`active` integer DEFAULT true NOT NULL,
	`start_date` integer,
	`end_date` integer,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `promotions_code_unique` ON `promotions` (`code`);--> statement-breakpoint
CREATE TABLE `sales_page_configs` (
	`id` text PRIMARY KEY NOT NULL,
	`internal_name` text NOT NULL,
	`content` text NOT NULL,
	`active` integer DEFAULT true NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `seo_configs` (
	`id` text PRIMARY KEY NOT NULL,
	`route` text NOT NULL,
	`title` text NOT NULL,
	`description` text NOT NULL,
	`canonical` text,
	`open_graph_image` text,
	`structured_data` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `seo_configs_route_unique` ON `seo_configs` (`route`);--> statement-breakpoint
CREATE TABLE `site_settings` (
	`key` text PRIMARY KEY NOT NULL,
	`value` text NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `testimonials` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`text` text NOT NULL,
	`photo` text,
	`rating` integer NOT NULL,
	`city` text,
	`verified` integer DEFAULT false NOT NULL,
	`active` integer DEFAULT false NOT NULL,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `urgency_campaigns` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`message` text NOT NULL,
	`start_date` integer,
	`end_date` integer,
	`active` integer DEFAULT false NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
INSERT OR IGNORE INTO `product_categories` (`id`,`name`,`slug`,`sort_order`,`active`,`created_at`,`updated_at`) VALUES ('cat-livros','Livros digitais','livros-digitais',1,1,unixepoch(),unixepoch());
--> statement-breakpoint
INSERT OR IGNORE INTO `products` (`id`,`name`,`slug`,`internal_name`,`description`,`price`,`compare_at_price`,`currency`,`active`,`featured`,`delivery_type`,`category_id`,`sort_order`,`created_at`,`updated_at`) VALUES
('livro-principal','O Caderno Esquecido','caderno-esquecido','Produto principal, demonstração','Receitas de família organizadas por ocasião e ingrediente.',2790,4790,'BRL',1,1,'digital','cat-livros',1,unixepoch(),unixepoch()),
('sobremesas','Caderno de Bolos e Sobremesas','bolos-sobremesas','Sobremesas, demonstração','Preparos para o café e para os domingos em família.',1990,NULL,'BRL',1,0,'digital','cat-livros',2,unixepoch(),unixepoch()),
('economicas','Receitas Econômicas','receitas-economicas','Econômicas, demonstração','Ideias simples para aproveitar melhor o que já está na cozinha.',1590,NULL,'BRL',1,0,'digital','cat-livros',3,unixepoch(),unixepoch()),
('ingredientes','Guia de Ingredientes Tradicionais','ingredientes-tradicionais','Ingredientes, demonstração','Notas culinárias sobre plantas e ingredientes conhecidos.',1490,NULL,'BRL',1,0,'digital','cat-livros',4,unixepoch(),unixepoch());
--> statement-breakpoint
INSERT OR IGNORE INTO `bundles` (`id`,`name`,`internal_name`,`slug`,`description`,`price`,`compare_at_price`,`currency`,`cta_text`,`recommended`,`default_selected`,`active`,`sort_order`,`created_at`,`updated_at`) VALUES
('essencial','Caderno Essencial','Bundle 1, demonstração','essencial','O livro principal para começar.',2790,4790,'BRL','QUERO O CADERNO',0,0,1,1,unixepoch(),unixepoch()),
('familia','Coleção da Família','Bundle 2, demonstração','familia','Livro principal, sobremesas e receitas econômicas.',4790,8330,'BRL','QUERO A COLEÇÃO',1,1,1,2,unixepoch(),unixepoch()),
('completa','Acervo Completo','Bundle 3, demonstração','completa','Todos os livros e o guia de ingredientes tradicionais.',5790,9820,'BRL','QUERO O ACERVO COMPLETO',0,0,1,3,unixepoch(),unixepoch());
--> statement-breakpoint
INSERT OR IGNORE INTO `bundle_items` (`bundle_id`,`product_id`,`quantity`,`sort_order`) VALUES ('essencial','livro-principal',1,1),('familia','livro-principal',1,1),('familia','sobremesas',1,2),('familia','economicas',1,3),('completa','livro-principal',1,1),('completa','sobremesas',1,2),('completa','economicas',1,3),('completa','ingredientes',1,4);
--> statement-breakpoint
INSERT OR IGNORE INTO `order_bumps` (`id`,`name`,`internal_name`,`headline`,`description`,`product_id`,`price_override`,`cta_text`,`location`,`active`,`priority`,`created_at`,`updated_at`) VALUES ('bump-sobremesas','Sobremesas no carrinho','Order bump, demonstração','Leve também o Caderno de Sobremesas','Bolos, pudins e receitas para acompanhar o café.','sobremesas',990,'ADICIONAR AO PEDIDO','cart',1,10,unixepoch(),unixepoch());
--> statement-breakpoint
INSERT OR IGNORE INTO `cart_offers` (`id`,`name`,`internal_name`,`headline`,`description`,`product_id`,`price_override`,`cta_text`,`active`,`priority`,`created_at`,`updated_at`) VALUES ('offer-ingredientes','Complete sua coleção','Cart offer, demonstração','Complete sua coleção','Acrescente o guia de ingredientes tradicionais.','ingredientes',1190,'ADICIONAR',1,10,unixepoch(),unixepoch());
--> statement-breakpoint
INSERT OR IGNORE INTO `exit_offers` (`id`,`stage`,`name`,`internal_name`,`headline`,`description`,`offer_type`,`bundle_id`,`discount_type`,`discount_value`,`cta_text`,`secondary_text`,`active`,`created_at`,`updated_at`) VALUES
('exit-1',1,'Comece pelo essencial','Exit 1, demonstração','Quer começar pelo essencial?','Leve o Caderno Esquecido com uma condição de saída.','bundle','essencial','percent',10,'SIM, QUERO COMEÇAR','Continuar navegando',1,unixepoch(),unixepoch()),
('exit-2',2,'Coleção da Família','Exit 2, demonstração','Tereza separou uma opção mais completa','Três cadernos com índice de consulta.','bundle','familia',NULL,0,'VER A COLEÇÃO','Continuar navegando',1,unixepoch(),unixepoch()),
('exit-3',3,'Última opção','Exit 3, demonstração','Uma última opção para esta sessão','Uma versão essencial mais econômica.','bundle','essencial','percent',15,'APROVEITAR A ÚLTIMA OPÇÃO','Não, obrigado',1,unixepoch(),unixepoch());
--> statement-breakpoint
INSERT OR IGNORE INTO `keywords` (`id`,`keyword`,`category`,`priority`,`intent`,`pages`,`active`,`created_at`,`updated_at`) VALUES ('kw-babosa','babosa','SEO',10,'informacional e produto','["/","/produto/ingredientes-tradicionais"]',1,unixepoch(),unixepoch());

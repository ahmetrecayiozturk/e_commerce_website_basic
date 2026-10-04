import { listCategories } from "@lib/data/categories";
import { listCollections } from "@lib/data/collections";
import { Text, clx } from "@modules/common/components/ui";
import LocalizedClientLink from "@modules/common/components/localized-client-link";

export default async function Footer() {
  const { collections } = await listCollections({
    fields: "*products",
  });
  const productCategories = await listCategories();

  return (
    <footer className="border-t border-ui-border-base w-full">
      <div className="content-container flex flex-col w-full">
        <div className="flex flex-col gap-y-6 xsmall:flex-row items-start justify-between py-40">
          <div>
            <LocalizedClientLink
              href="/"
              className="txt-compact-xlarge-plus text-ui-fg-subtle hover:text-ui-fg-base uppercase"
            >
              LegnoNest
            </LocalizedClientLink>
          </div>
          {/* Sütun sayısını sm:grid-cols-4 olarak güncelledik */}
          <div className="text-small-regular gap-10 md:gap-x-16 grid grid-cols-2 sm:grid-cols-4">
            
            {/* 1. KATEGORİLER SÜTUNU */}
            {productCategories && productCategories?.length > 0 && (
              <div className="flex flex-col gap-y-2">
                <span className="txt-small-plus txt-ui-fg-base">
                  Kategoriler
                </span>
                <ul
                  className="grid grid-cols-1 gap-2"
                  data-testid="footer-categories"
                >
                  {productCategories?.slice(0, 6).map((c) => {
                    if (c.parent_category) {
                      return;
                    }

                    const children =
                      c.category_children?.map((child) => ({
                        name: child.name,
                        handle: child.handle,
                        id: child.id,
                      })) || null;

                    return (
                      <li
                        className="flex flex-col gap-2 text-ui-fg-subtle txt-small"
                        key={c.id}
                      >
                        <LocalizedClientLink
                          className={clx(
                            "hover:text-ui-fg-base",
                            children && "txt-small-plus"
                          )}
                          href={`/categories/${c.handle}`}
                          data-testid="category-link"
                        >
                          {c.name}
                        </LocalizedClientLink>
                        {children && (
                          <ul className="grid grid-cols-1 ml-3 gap-2">
                            {children &&
                              children.map((child) => (
                                <li key={child.id}>
                                  <LocalizedClientLink
                                    className="hover:text-ui-fg-base"
                                    href={`/categories/${child.handle}`}
                                    data-testid="category-link"
                                  >
                                    {child.name}
                                  </LocalizedClientLink>
                                </li>
                              ))}
                          </ul>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}

            {/* 2. KOLEKSİYONLAR SÜTUNU */}
            {collections && collections.length > 0 && (
              <div className="flex flex-col gap-y-2">
                <span className="txt-small-plus txt-ui-fg-base">
                  Koleksiyonlar
                </span>
                <ul
                  className={clx(
                    "grid grid-cols-1 gap-2 text-ui-fg-subtle txt-small",
                    {
                      "grid-cols-2": (collections?.length || 0) > 3,
                    }
                  )}
                >
                  {collections?.slice(0, 6).map((c) => (
                    <li key={c.id}>
                      <LocalizedClientLink
                        className="hover:text-ui-fg-base"
                        href={`/collections/${c.handle}`}
                      >
                        {c.title}
                      </LocalizedClientLink>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* 3. KURUMSAL (YASAL METİNLER) SÜTUNU - YENİ EKLENDİ */}
            <div className="flex flex-col gap-y-2">
              <span className="txt-small-plus txt-ui-fg-base">Kurumsal</span>
              <ul className="grid grid-cols-1 gap-y-2 text-ui-fg-subtle txt-small">
                <li>
                  <LocalizedClientLink href="/content/terms-of-use" className="hover:text-ui-fg-base">
                    Mesafeli Satış Sözleşmesi
                  </LocalizedClientLink>
                </li>
                <li>
                  <LocalizedClientLink href="/content/privacy-policy" className="hover:text-ui-fg-base">
                    Gizlilik Politikası ve KVKK
                  </LocalizedClientLink>
                </li>
                <li>
                  {/* İleride iade şartları sayfasını açarsan buraya linkini verebilirsin */}
                  <LocalizedClientLink href="/content/terms-of-use" className="hover:text-ui-fg-base">
                    İade ve İptal Şartları
                  </LocalizedClientLink>
                </li>
              </ul>
            </div>

            {/* 4. İLETİŞİM SÜTUNU */}
            <div className="flex flex-col gap-y-2">
              <span className="txt-small-plus txt-ui-fg-base">İletişim</span>
              <ul className="grid grid-cols-1 gap-y-2 text-ui-fg-subtle txt-small">
                <li>
                  <a
                    href="mailto:legnonest@gmail.com"
                    className="hover:text-ui-fg-base"
                  >
                    legnonest@gmail.com
                  </a>
                </li>
                <li>
                  <a
                    href="tel:+905555555555"
                    className="hover:text-ui-fg-base"
                  >
                    +90 555 555 55 55
                  </a>
                </li>
                <li>
                  <a
                    href="https://instagram.com/legnonest"
                    target="_blank"
                    rel="noreferrer"
                    className="hover:text-ui-fg-base"
                  >
                    @legnonest
                  </a>
                </li>
                <li className="text-ui-fg-muted">
                  İstanbul, Türkiye {/* Kendi adresini yazabilirsin */}
                </li>
              </ul>
            </div>
          </div>
        </div>
        
        {/* EN ALT KISIM (COPYRIGHT VE MEDUSA LOGOSUNUN KALDIRILDIĞI YER) */}
        <div className="flex w-full mb-16 justify-center text-ui-fg-muted">
          <Text className="txt-compact-small">
            © {new Date().getFullYear()} LegnoNest. Tüm hakları saklıdır.
          </Text>
        </div>
      </div>
    </footer>
  );
}
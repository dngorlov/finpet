# Shop rows scan; consent stays on the item

A Магазин row is a scan line: name, pixel price, meter icons, and a chip only when it is true («Счёт», «Цель», «Куплено», «Один раз»). «Не хватает N» replaces a negative «после покупки» when Баланс cannot cover the price, and «Купить» is absent until it can. The description, «после покупки», and the buy confirm stay on the item, so the list does not repeat the balance math. The plan remainder reads «В плане осталось N» on Магазин and Копилка, because «Осталось N» did not say it was the План.

## Considered options

- **Keep «после покупки» and the category on every row**: rejected — the tab already says the kind, and the balance is in the strip. Consent fits the item phase.
- **Show the ways out only after «Купить» fails**: rejected — the row already states the shortfall, so the failed tap taught nothing new.

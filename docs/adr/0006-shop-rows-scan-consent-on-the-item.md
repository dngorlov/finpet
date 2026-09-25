# Shop rows scan; consent stays on the item

A Магазин row is a scan line: an emoji for the item, the name, a pixel price with the coins icon, and effect chips («+10», and «−15» while an unpaid Счёт is due). «Цель», «Куплено», and «Один раз» sit on the next row. The «−15» chip is the day-close drop — Сытость for Обед, Настроение once for any other unpaid Счёт — and it leaves once that item is bought. TalkBack says «Если не купить Проезд, Настроение −15 один раз»; the visible chip is only the meter icon and «−15». «Не хватает N» replaces a negative «после покупки» when Баланс cannot cover the price, and «Купить» is absent until it can. The description, «после покупки», and the buy confirm stay on the item, so the list does not repeat the balance math. The plan remainder reads «В плане осталось N» on Магазин and Копилка, because «Осталось N» did not say it was the План.

## Considered options

- **Keep «после покупки» and the category on every row**: rejected — the tab already says the kind, and the balance is in the strip. Consent fits the item phase.
- **Show the ways out only after «Купить» fails**: rejected — the row already states the shortfall, so the failed tap taught nothing new.
- **A «Счёт» word on each due row**: rejected — the chip should say what skipping does. Writing «если не купить» on the chip was too long, so the minus carries it and TalkBack carries the sentence.
- **«−15» on every non-food Счёт as its own drop**: rejected — skipping two of them still drops Настроение by 15 once. The visible chips repeat «−15»; TalkBack says «один раз».

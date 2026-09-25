import { useCallback, useState } from "react";
import { StyleSheet, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { checkDeposit, depositPayout, maturesOnDay } from "../../core/bank";
import { BANK } from "../../core/config";
import { META_KEYS } from "../../data/metaKeys";
import type { DayState, DepositView } from "../../data/repositories/gameRepository";
import { AmountStepper } from "../components/AmountStepper";
import { CoinText } from "../components/CoinText";
import { ScreenTitle } from "../components/ScreenTitle";
import { Card } from "../components/Card";
import { Chip } from "../components/Chip";
import { FeedbackCard, type FeedbackModel } from "../components/FeedbackCard";
import { PrimaryButton } from "../components/PrimaryButton";
import { Screen } from "../components/Screen";
import { TextButton } from "../components/TextButton";
import { usePlayChrome } from "../navigation/playChrome";
import { useSession } from "../session/SessionProvider";
import { strings } from "../strings";
import { colors, spacing, type } from "../theme";

/**
 * Банк — separate from Копилка: a вклад takes coins out of Баланс for a fixed
 * number of Игровые дни and returns them with interest (collected on Дом when
 * the day opens). No early withdrawal.
 */
export default function BankScreen() {
  const { game, meta } = useSession();
  const { touchChrome } = usePlayChrome();
  const [day, setDay] = useState<DayState | null>(null);
  const [balance, setBalance] = useState(0);
  const [deposits, setDeposits] = useState<DepositView[]>([]);
  const [offerId, setOfferId] = useState<string>(BANK.offers[0].id);
  const [amount, setAmount] = useState<number>(BANK.minDeposit);
  const [confirming, setConfirming] = useState(false);
  const [feedback, setFeedback] = useState<FeedbackModel | null>(null);

  const load = useCallback(() => {
    const profileId = meta.get(META_KEYS.activeProfileId);
    if (!profileId) return;
    setDay(game.dayState(profileId));
    setBalance(game.getProfile(profileId).balance);
    setDeposits(game.listDeposits(profileId));
    touchChrome();
  }, [game, meta, touchChrome]);

  useFocusEffect(
    useCallback(() => {
      load();
      setConfirming(false);
    }, [load]),
  );

  const offer = BANK.offers.find((item) => item.id === offerId) ?? BANK.offers[0];
  const payout = depositPayout(amount, offer.ratePercent);
  const check = checkDeposit(balance, amount);
  const canOpen = Boolean(day?.open) && check.status === "ok";
  const returnsOn = day ? maturesOnDay(day.n, offer.days) : 0;

  const open = () => {
    const profileId = meta.get(META_KEYS.activeProfileId);
    if (!profileId || !day) return;
    const result = game.openDeposit(profileId, day.dayId, offer.id, amount);
    setConfirming(false);
    if (result.status === "ok") {
      setFeedback({
        deltas: { balance: -amount },
        cause: strings.feedbackCauseBankIn,
        nextStep: strings.feedbackNextBankIn,
      });
    }
    load();
  };

  if (day && !day.open) {
    return (
      <Screen>
        <ScreenTitle style={styles.title}>{strings.bankTitle}</ScreenTitle>
        <CoinText text={strings.waitingEconomyHint} style={styles.body} />
      </Screen>
    );
  }

  return (
    <Screen
      footer={
        confirming ? (
          <>
            <TextButton label={strings.close} onPress={() => setConfirming(false)} />
            <PrimaryButton label={strings.bankOpen} onPress={open} />
          </>
        ) : (
          <PrimaryButton label={strings.bankOpen} disabled={!canOpen} onPress={() => setConfirming(true)} />
        )
      }
    >
      <ScreenTitle style={styles.title}>{strings.bankTitle}</ScreenTitle>
      <CoinText text={strings.bankIntro} style={styles.body} />
      <View style={styles.row}>
        {BANK.offers.map((item) => (
          <Chip
            key={item.id}
            label={strings.bankOfferLabel(item.days, item.ratePercent)}
            selected={item.id === offer.id}
            onPress={() => setOfferId(item.id)}
          />
        ))}
      </View>
      <Card>
        <AmountStepper
          label={strings.bankAmount}
          pictogram={strings.navBankPictogram}
          value={amount}
          min={0}
          max={Math.max(balance, 0)}
          showTrack
          onChange={setAmount}
        />
        <CoinText coin text={strings.bankPreview(amount, payout, offer.days)} style={styles.body} />
        {check.status === "tooSmall" ? <CoinText text={strings.bankMin(check.min)} style={styles.body} /> : null}
      </Card>
      {confirming ? (
        <Card>
          <CoinText text={strings.bankConfirmTitle} style={styles.section} />
          <CoinText text={strings.bankConfirmBody(amount, returnsOn)} style={styles.body} />
        </Card>
      ) : null}
      <CoinText text={strings.bankActive} style={styles.section} />
      {deposits.length === 0 ? <CoinText text={strings.bankEmpty} style={styles.body} /> : null}
      {deposits.map((dep) => (
        <Card key={dep.id}>
          <CoinText coin text={strings.bankDepositLine(dep.amount, dep.ratePercent, dep.payout)} style={styles.body} />
          <CoinText text={dep.status === "paid" ? strings.bankPaid : strings.bankDaysLeft(dep.daysLeft)} style={styles.body} />
        </Card>
      ))}
      {feedback ? <FeedbackCard model={feedback} onDismiss={() => setFeedback(null)} /> : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: {
    color: colors.text,
    fontSize: type.title,
    fontWeight: "700",
  },
  section: {
    color: colors.text,
    fontSize: type.section,
    fontWeight: "700",
  },
  body: {
    color: colors.text,
    fontSize: type.body,
  },
  row: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.s,
  },
});

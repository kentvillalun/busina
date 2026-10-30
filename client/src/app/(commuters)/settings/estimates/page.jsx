import { Body, Card, DetailPage } from "@/components/settings/DetailPage";

const Item = ({ title, children }) => (
  <Card>
    <h2 className="font-medium text-ink">{title}</h2>
    <Body>{children}</Body>
  </Card>
);

export default function EstimatesPage() {
  return (
    <DetailPage title="How estimates work">
      <Item title="Where the bus is">
        Each bus has a GPS device. Its position is placed on the road the bus follows, so the pin stays on the road
        even when the GPS is a little off.
      </Item>
      <Item title="When it arrives">
        We measure the road left between the bus and you and divide it by the speed of the bus. Traffic changes, so we
        show a range, like 18–22 min, never one exact number. A bus that has stopped is treated as moving slowly.
      </Item>
      <Item title="Seats">
        Seat sensors tell us which seats are taken, so the seat map is live. The number of people on board is
        estimated from the door counter, and it can include people standing.
      </Item>
      <Item title="When the signal is lost">
        If a bus stops reporting, we say so and show no seats or arrival time until it reports again. We would rather
        show nothing than a wrong answer.
      </Item>
    </DetailPage>
  );
}

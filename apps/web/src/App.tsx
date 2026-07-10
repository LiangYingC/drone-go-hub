import { AdvisoryInfoPanel } from "@/components/advisory/AdvisoryInfoPanel";
import { AdvisoryLegend } from "@/components/advisory/AdvisoryLegend";
import { Disclaimer } from "@/components/disclaimer/Disclaimer";
import { MapView } from "@/components/map/MapView";

function App() {
  return (
    <div className="fixed inset-0">
      <MapView />
      <AdvisoryLegend />
      <AdvisoryInfoPanel />
      <Disclaimer />
    </div>
  );
}

export default App;

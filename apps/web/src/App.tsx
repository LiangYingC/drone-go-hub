import { Disclaimer } from "@/components/disclaimer/Disclaimer";
import { MapView } from "@/components/map/MapView";

function App() {
  return (
    <div className="fixed inset-0">
      <MapView />
      <Disclaimer />
    </div>
  );
}

export default App;

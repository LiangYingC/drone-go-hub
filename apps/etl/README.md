# @dronegohub/etl

_最後更新：2026-07-13_

把官方開放資料轉成前端可直接載入的靜態 GeoJSON（`apps/web/public/data/advisory/`）。輸出的 Feature `properties` 對齊 `apps/web` 的 `AdvisoryZoneProperties`（以 type-only import 單一來源，不產生建置耦合）。

## 管線

### 限航區（`restrictedZone`）

```bash
pnpm etl:restricted-zone   # 於 repo root
```

流程：經 data.gov.tw API 解析資料集 49021 的 manifest CSV → 與內建的 eAIP 現行清單（`src/restrictedZone/eaipCurrentList.ts`）互相核對 → 逐區下載 KML、取其閉合邊界線轉為 Polygon → 東沙／南沙依 eAIP 公告的圓心＋半徑產生圓形 → 驗證（閉合、繞向、範圍）→ 輸出（一區一行，重跑 byte-stable，git diff 乾淨）。

## 資料源實測紀錄（2026-07 查核）

維護前先讀，這些坑再踩一次很花時間：

- **49021 的 distribution 不是圖資本體**，是一份 manifest CSV（`名稱,版本,時間,路徑`，UTF-8 BOM），一列一個 KML 下載連結。
- **45701 的 manifest 有填錯**：「(總)禁止施放…範圍」列指到 id=5617，實際上那是 49021 的限航區總檔；機場正確總檔為 id=5537（見局網 a=1287）。各機場單檔則正確。
- **KML 沒有 Polygon**：全部以 LineString（邊界）＋ Point（標記）繪製。限航區每區恰好一條「首尾閉合」的 LineString，可直接封環；**機場（45701）連 SHP 都是 PolyLine**（每場切成多段直線＋弧線），做機場層時必須先把線段縫合成面。45701 的 SHP RAR 內有「2度分帶」（TWD97）與「經緯度」（WGS84）兩套。
- **開放資料是 107 年 8 月（2018-08-31）版**，比 eAIP 現行清單舊：RCR2（考潭）、RCR49 已廢止但檔案仍在，管線會剔除並記錄。
- **「東、南沙群島」KML 是 CAD 碎線**（數十條不閉合線段），不可用；eAIP 將兩區定義為圓（半徑 10 NM），故改由圓心＋半徑直接產生。
- **eAIP URL 每次修訂（AIRAC AMDT）都會變**，不適合當執行期依賴；現行清單以人工核對後固定在 `eaipCurrentList.ts`，檔頭註明依據的修訂版次。

## 更新程序

資料為不定期更新。要刷新時：

1. 到 [eAIP](https://ais.caa.gov.tw/) 找最新 AIRAC AMDT 的 `ENR 5.1`，逐列核對 `eaipCurrentList.ts`（區號、垂直範圍、圓形定義），更新 `EAIP_AMENDMENT`。
2. 重跑 `pnpm etl:restricted-zone`，看摘要輸出的「已剔除／略過」是否符合預期。
3. 輸出 diff 即審查素材：一區一行，異動一目了然。

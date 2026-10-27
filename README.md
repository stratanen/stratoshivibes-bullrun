# StratoshiVibes Bull Run

Arcade αγώνες αυτοκινήτων για το Solana Seeker. Έχει εννιά πίστες σε τρεις «αγορές» (Bull Market, Halving Canyon, Bear Market), ατελείωτη διαδρομή και γκαράζ με χρώματα. Το παιχνίδι είναι δωρεάν και χωρίς διαφημίσεις. Το πορτοφόλι είναι προαιρετικό. Το Shop πουλάει μόνο εμφάνιση και τίποτα που κάνει το αυτοκίνητο πιο γρήγορο.

- Παιχνίδι: https://bullrun.stratoshivibes.com/
- Απόρρητο: https://bullrun.stratoshivibes.com/privacy.html
- Όροι: https://bullrun.stratoshivibes.com/terms.html

## Ρύθμιση μία φορά

### 1. GitHub Pages
**Settings → Pages**:
1. Source: «Deploy from a branch».
2. Branch: `main`, folder: `/ (root)`.
3. Πάτα **Save**.

Στο ίδιο σημείο, στο **Custom domain**, πρέπει να γράφει `bullrun.stratoshivibes.com`. Το διαβάζει μόνο του από το αρχείο `CNAME`. Μόλις εμφανιστεί η επιλογή, τσέκαρε **Enforce HTTPS**.

### 2. DNS (εκεί που είναι το stratoshivibes.com, π.χ. Cloudflare)
Πρόσθεσε μια εγγραφή:
- Type: `CNAME`
- Name: `bullrun`
- Target: `stratanen.github.io`
- Αν είναι στο Cloudflare, Proxy status: **DNS only** (γκρι σύννεφο), όπως για το blockspace.

### 3. Κωδικός για το APK
**Settings → Secrets and variables → Actions → New repository secret**:
- Name: `KEYSTORE_PASSWORD`
- Value: ο ίδιος κωδικός που έβαλες στο Mahjong και στο Blockspace.

### 4. Helius
Στο Helius dashboard, στο API key που χρησιμοποιούν τα παιχνίδια, πρόσθεσε το `bullrun.stratoshivibes.com` στα allowed domains. Χωρίς αυτό δεν δουλεύει ο έλεγχος των Degens ούτε το Shop.

### 5. Κατάταξη
Ακολούθησε τα βήματα στο [`leaderboard/README.md`](leaderboard/README.md). Είναι μία επικόλληση κώδικα στον server που ήδη τρέχει για το Blockspace.

## Φτιάξε το Android APK

Το APK είναι ένα Solana Mobile web shell που ανοίγει το παιχνίδι από τη διεύθυνσή του. Το χτίζει το GitHub Actions.

1. **Actions → Build Android APK → Run workflow**.
2. Στο **version_code** βάλε 1 την πρώτη φορά και ανέβαζέ το κατά 1 σε κάθε νέα έκδοση (1, 2, 3 …).
3. Στο **version_name** βάλε π.χ. `1.0.0`.
4. Όταν τελειώσει, το APK είναι στη σελίδα **Releases**.

Το APK υπογράφεται με το ίδιο κλειδί StratoshiVibes (`release.keystore.enc`) όπως τα άλλα παιχνίδια.

Για αλλαγές στο παιχνίδι δεν χρειάζεται νέο APK. Ανεβαίνουν εδώ και φαίνονται αμέσως. Νέο APK χρειάζεται μόνο όταν αλλάζει το όνομα, το εικονίδιο ή κάτι στο ίδιο το APK.

## Όταν αλλάζεις αρχεία

Σε κάθε αλλαγή ανέβαζε τον αριθμό στο `sw.js` (`sv-bullrun-v1` → `sv-bullrun-v2`). Έτσι τα κινητά παίρνουν τη νέα έκδοση.

## Τι υπάρχει στο repo

| Αρχείο | Τι είναι |
| --- | --- |
| `index.html` | Όλο το παιχνίδι |
| `vendor/three/` | Η 3D μηχανή three.js (MIT), τοπικά για να παίζει και offline |
| `fonts/` | Γραμματοσειρές Saira και Commissioner (OFL) |
| `wallet.bundle.js`, `pay.bundle.js` | Σύνδεση πορτοφολιού και πληρωμές, ίδια με το Blockspace |
| `sw.js` | Offline λειτουργία |
| `leaderboard/` | Ο server της κατάταξης (κοινός με το Blockspace) |
| `privacy.html`, `terms.html` | Σελίδες για το store |
| `.github/workflows/build-apk.yml` | Κατασκευή APK |

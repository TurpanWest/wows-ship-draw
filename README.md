# 🎯 World of Warships Ship Drawer

This web tool is designed for World of Warships players who suffer from choice paralysis — if you're staring at your port full of ships and can't decide which one to play today, just draw one randomly!

**Now supports both English and Chinese (中文) languages!** 🇺🇸🇨🇳

---

## 🔧 Features

- ✅ **Built-in T10 Ship List**: Covers Destroyers (DD), Cruisers (CA), Battleships (BB), Aircraft Carriers (CV), and Submarines (SS). All cruisers are labeled as CA for simplified classification.
- ✅ **Custom Ships**: Add your own ships by entering the name and selecting the ship type.
- ✅ **Ship Management**:
  - Uncheck → Temporarily exclude a ship (e.g., you don't want to play it today).
  - Click ❌ → Permanently remove the ship from the list (useful if you don't own it).
- ✅ **Exclude Ship Types**: Check "Exclude CV" or "Exclude SS" to remove aircraft carriers or submarines from the random pool.
- ✅ **Reset to Default**: Click "Reset to Default" to restore the drawing pool to the preset T10 ship list.
- ✅ **Multi-language Support**: Switch between English and Chinese (中文) with the language buttons in the top-right corner.

## 🌐 Languages

- **English** (Default): Full English interface with English ship names
- **中文**: Complete Chinese interface with Chinese ship names
- Language preference is saved locally and persists between sessions

## 🚀 How to Use

You can access this tool online via [GitHub Pages](https://turpanwest.github.io/wows-ship-draw/).

### Local Development
```bash
# Clone the repository
git clone https://github.com/turpanwest/wows-ship-draw.git

# Navigate to the directory
cd wows-ship-draw

# Start a local server (Python 3)
python -m http.server 8000
```

---

## 🛠️ Future Plans

- Support filtering ships by nation/special ships (premium ships)
- Add "Ship Type Weight" feature for players who prefer certain ship types
- Add more languages support
- Mobile app version

---

## 📝 License

This project is open source and available under the [MIT License](LICENSE). 


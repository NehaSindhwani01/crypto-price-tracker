const Footer = () => {
  return (
    <footer className="bg-gray-900 text-gray-400 px-6 py-8 text-sm">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-start gap-8">

        {/* Branding + Language */}
        <div>
          <h2 className="text-white text-xl font-semibold mb-2">CryptoPrice Tracker</h2>
          <div className="flex gap-2">
            <button className="bg-gray-800 text-white px-3 py-1 rounded">🌐 English</button>
            <button className="bg-gray-800 text-white px-3 py-1 rounded">💲 USD</button>
          </div>
        </div>

        {/* About Project */}
        <div>
          <h3 className="text-white font-semibold mb-2">About</h3>
          <p className="max-w-xs">
            This is a personal project built with Next.js to track real-time cryptocurrency prices using public APIs.
          </p>
        </div>

        {/* Contact Info */}
        <div>
          <h3 className="text-white font-semibold mb-2">Contact</h3>
          <p>Email: <a href="mailto:nehasindhwani01@gmail.com" className="text-cyan-400 hover:underline">nehasindhwani01@gmail.com</a></p>
          <p>GitHub: <a href="https://github.com/NehaSindhwani01" target="_blank" className="text-cyan-400 hover:underline">NehaSindhwani01</a></p>
        </div>
      </div>

      {/* Bottom Line */}
      <div className="mt-8 border-t border-gray-700 pt-4 text-center text-xs text-gray-500">
        © 2025 CryptoPrice Tracker. Built with 💙 by Neha Sindhwani
      </div>
    </footer>
  );
};

export default Footer;

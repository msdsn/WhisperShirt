import { Link } from "react-router-dom";

export default function About() {
  return (
    <div className="min-h-screen bg-amber-50 text-gray-800 p-4 md:p-8 font-serif">
      <header className="flex items-center justify-start p-4 md:p-6">
        <Link to="/" className="text-xl font-bold">
          ws
        </Link>
      </header>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl md:text-6xl font-bold text-center mb-8 text-brown-600">What are Whisper Shirts?</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="space-y-4 order-2 md:order-1">
            <p className="text-lg leading-relaxed">
              In a world where technology whispers secrets of the future, Whisper Shirts stand as silent heralds of the AI revolution. These aren't just garments; they're wearable whispers of wisdom, each thread interwoven with the essence of artificial intelligence.
            </p>
            <p className="text-lg leading-relaxed">
              Imagine donning a shirt that knows your thoughts before you do, or wearing a design crafted by an algorithm that understands beauty better than any human eye. That's the magic of Whisper Shirts – where silicon dreams meet cotton reality.
            </p>
          </div>
          
          <div className="grid grid-cols-2 gap-4 order-1 md:order-2">
            <img src="/about1.jpg" width={200} height={200} alt="AI-designed shirt 1" className="w-full h-auto rounded-lg shadow-md" />
            <img src="/about2.jpg" width={200} height={200} alt="AI-designed shirt 2" className="w-full h-auto rounded-lg shadow-md" />
            <img src="/about3.jpg" width={200} height={200} alt="AI-designed shirt 3" className="w-full h-auto rounded-lg shadow-md" />
            <img src="/about4.jpg" width={200} height={200} alt="AI-designed shirt 4" className="w-full h-auto rounded-lg shadow-md" />
          </div>
        </div>
        
        <div className="mt-12 text-center">
          <p className="text-xl italic">"In the soft rustle of fabric, hear the future speak."</p>
        </div>
        
        <div className="mt-8 border-t border-brown-300 pt-8">
          <h2 className="text-2xl font-semibold mb-4">The Story Continues...</h2>
          <p className="text-lg leading-relaxed">
            As you turn the page of fashion, Whisper Shirts invite you to a new chapter where your wardrobe becomes a library of innovation. Each shirt is a page, each design a paragraph in the ever-unfolding story of human-AI collaboration.
          </p>
        </div>
      </div>
    </div>
  )
}
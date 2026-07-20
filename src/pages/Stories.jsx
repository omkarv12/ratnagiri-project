import { BookText, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Stories() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 p-10">
      <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="bg-orange-600 text-white py-12 text-center">
          <BookText size={60} className="mx-auto mb-4" />
          <h1 className="text-4xl font-bold">Stories</h1>
          <p className="text-white/90 mt-2">
            Read stories and experiences from Ratnagiri
          </p>
        </div>

        <div className="p-10">
          <article className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-slate-800 mb-2">
              Dapoli: Temples, Beaches and Forts
            </h2>
            <p className="text-sm text-slate-500 mb-8 italic">
              By Khursheed Dinshaw
            </p>

            <p className="text-lg text-slate-700 leading-8 mb-6">
              In February this year — as I set out to plan a vacation with my
              sister — her travel checklist left me flummoxed. I was to find
              us a spot away from the urban chaos that had a beach, several
              sightseeing options, and authentic regional cuisine. And that
              is how we landed up spending four days in Dapoli, a small town
              in Maharashtra's Ratnagiri district.
            </p>

            <p className="text-lg text-slate-700 leading-8 mb-2">
              Our trip started with a visit to the 12th Century Kadyavarcha
              Ganpati temple famous for the idol of lord Ganesh wherein his
              trunk is turned toward the right, which is both rare and
              considered auspicious. There is also a Shiva temple on the
              premises.
            </p>

            <figure className="my-6">
              <img
                src="/stories/dapoli-trip/kadyavarcha-ganpati-temple.jpg"
                alt="Kadyavarcha Ganpati Temple"
                className="w-full rounded-xl shadow-md"
              />
              <figcaption className="text-sm text-slate-500 text-center mt-2">
                Kadyavarcha Ganpati Temple
              </figcaption>
            </figure>

            <p className="text-lg text-slate-700 leading-8 mb-6">
              On that summer day, my eyes veered towards the shops lining the
              temple that offer sherbets made from kokum, amla, jamun, and
              karvand (wild berry). This, alongside ladoos made from
              nutritionally dense aliv seeds; poli, a sweet flatbread made
              with a filling of either jackfruit or mango; and crunchy raw
              jackfruit chips satiated our morning cravings.
            </p>

            <p className="text-lg text-slate-700 leading-8 mb-6">
              From the temple, we took the steps leading down to the stone
              believed to be imprinted with the footprint of lord Ganesh.
              Sitting next to it, watching the sunset over the hills, was
              both relaxing and therapeutic. Away from the blaring horns,
              the serenity of Dapoli was refreshing. A short drive from the
              temple got us to the imposing 30 metre tall Kelshi (Anjarle)
              lighthouse whose range of light of 23 nautical miles has been
              helping boats to navigate the Arabian Sea.
            </p>

            <figure className="my-6">
              <img
                src="/stories/dapoli-trip/murud-beach.jpg"
                alt="Murud Beach"
                className="w-full rounded-xl shadow-md"
              />
              <figcaption className="text-sm text-slate-500 text-center mt-2">
                Murud Beach | Photo Credit: Fahad Puthawala
              </figcaption>
            </figure>

            <p className="text-lg text-slate-700 leading-8 mb-6">
              Across the lighthouse is the pristine Anjarle beach, which is
              less crowded than the other beaches in the Konkan. Though it
              was dark by the time we reached, the moonlit the beach with
              its glow, made our night stroll enjoyable. Two other secluded
              beaches include the three kilometre long Kelshi beach, known
              for stunning sunsets, and Tamastirth beach, characterised by
              its distinct reddish shade of water.
            </p>

            <p className="text-lg text-slate-700 leading-8 mb-6">
              Dinner at our resort's in-house Konkan restaurant included
              Konkani curries prepared with jackfruit and coconut, vegetables
              cooked in freshly ground local spices, rotis made from rice
              flour with seafood specialities of prawns, pomfret, rawas and
              surmai. Desserts were the delectable puran poli (a flatbread
              with a stuffing of Bengal gram and jaggery) and ukadiche modak
              (rice flour dumplings with a filling of jaggery and coconut).
            </p>

            <figure className="my-6">
              <img
                src="/stories/dapoli-trip/himmatgad-fort.jpg"
                alt="Himmatgad Fort"
                className="w-full rounded-xl shadow-md"
              />
              <figcaption className="text-sm text-slate-500 text-center mt-2">
                Himmatgad Fort | Photo Credit: Khursheed Dinshaw
              </figcaption>
            </figure>

            <p className="text-lg text-slate-700 leading-8 mb-6">
              The next morning, we strolled to Murud beach to catch the sun
              bathe the horizon in an orange glow above the silhouettes of
              coconut trees lining the beach.
            </p>

            <p className="text-lg text-slate-700 leading-8 mb-6">
              Our plan for the day was to drive to the historically
              significant Himmatgad fort, also known as Bankot fort or Fort
              Victoria. The two-hour drive was peppered with winding roads
              and mango orchards heralding the arrival of the mango season
              with flowers in bloom. Ratnagiri is well-known for its
              GI-tagged alphonso mangoes or hapus, and as ardent mango
              lovers, hapus is our absolute favourite.
            </p>

            <figure className="my-6">
              <img
                src="/stories/dapoli-trip/parshuram-bhumi.jpg"
                alt="Parshuram Bhumi"
                className="w-full rounded-xl shadow-md"
              />
              <figcaption className="text-sm text-slate-500 text-center mt-2">
                Parshuram Bhumi
              </figcaption>
            </figure>

            <p className="text-lg text-slate-700 leading-8 mb-6">
              Surprisingly, we were the only visitors at the coastal fort.
              With the sun beating down upon us, the cool breeze from the
              Arabian Sea provided a welcome respite. We took the stone
              steps to get to the fort's bastions, and soaked in sweeping
              views of the sea. A solitary cannon with etchings of 1797 and
              the symbol of the British crown still stood guard facing the
              sea.
            </p>

            <p className="text-lg text-slate-700 leading-8 mb-6">
              Another morning, a half-day excursion took us to Burondi
              village to visit Parshuram Bhumi, which is a meditation hall
              located atop a scenic hill. The 21-foot-high statue of
              Parshuram, believed to be the sixth incarnation of Lord
              Vishnu, stands upon a semi-circular dome representing Mother
              Earth. This dome doubles up as a meditation hall, and since it
              is built using the ferrocrete technique, the chanting inside
              it echoes evenly. In fact, even when we walked inside, our
              footsteps echoed.
            </p>

            <p className="text-lg text-slate-700 leading-8 mb-6">
              Energised from our chanting, we drove further to the Chandika
              Devi temple, which is located in Dabhol. The vermillion-covered
              stone idol of the goddess is inside an oil-lit cave. No
              artificial light is present inside the temple.
            </p>

            <figure className="my-6">
              <img
                src="/stories/dapoli-trip/chandika-devi-temple.jpg"
                alt="Chandika Devi Temple"
                className="w-full rounded-xl shadow-md"
              />
              <figcaption className="text-sm text-slate-500 text-center mt-2">
                Chandika Devi Temple
              </figcaption>
            </figure>

            <p className="text-lg text-slate-700 leading-8 mb-6">
              The cave temple set amidst rocks and lush trees has ample
              parking space. The lady selling solkadhi, Konkan's pink
              coloured beverage made with kokum and coconut milk, was doing
              brisk business. Since it was our last evening in Dapoli, we
              relaxed at the resort, playing indoor games, honing our
              archery skills and gazing at the star-studded, clear sky
              surrounded by the property's jackfruit and coconut trees.
            </p>

            <p className="text-lg text-slate-700 leading-8">
              When it was time to head back home, we reminisced about how
              our Dapoli vacation allowed us to unwind, bond as siblings and
              briefly experience a slow-paced lifestyle.
            </p>
          </article>

          <button
            onClick={() => navigate("/dashboard")}
            className="mt-10 flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-xl transition-all duration-300"
          >
            <ArrowLeft size={20} />
            Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
/*
    🎯 STANDARD-MODUS FRAGEN
    50 Allgemeinwissen-Fragen (10 Kategorien × 5 Fragen)
    Entwickler: Nico Kaschube | Berufsbildungswerk im Oberlinhaus Potsdam | 2025
*/

// Fragen-Datenbank
const jeopardyData = {
    categories: [
        {
            name: "🏛️ Geschichte",
            questions: [
                { question: "In welchem Jahr fiel die Berliner Mauer?", answer: "1989", points: 100 },
                { question: "Wer war der erste Bundeskanzler Deutschlands?", answer: "Konrad Adenauer", points: 200 },
                { question: "In welchem Jahr begann der Zweite Weltkrieg?", answer: "1939", points: 300 },
                { question: "Welche Revolution fand 1789 in Frankreich statt?", answer: "Die Französische Revolution", points: 400 },
                { question: "Wann endete das Römische Reich offiziell?", answer: "476 n. Chr.", points: 500 }
            ]
        },
        {
            name: "🌍 Geografie",
            questions: [
                { question: "Was ist die Hauptstadt von Frankreich?", answer: "Paris", points: 100 },
                { question: "Wie viele Bundesländer hat Deutschland?", answer: "16", points: 200 },
                { question: "Welcher ist der längste Fluss Europas?", answer: "Die Wolga", points: 300 },
                { question: "Welches ist das flächenmäßig größte Land der Erde?", answer: "Russland", points: 400 },
                { question: "Wie viele Kontinente gibt es?", answer: "7 (Afrika, Antarktika, Asien, Australien, Europa, Nordamerika, Südamerika)", points: 500 }
            ]
        },
        {
            name: "⚽ Sport",
            questions: [
                { question: "Wie viele Spieler hat eine Fußballmannschaft auf dem Feld?", answer: "11", points: 100 },
                { question: "In welchem Land fanden die Olympischen Spiele 2020 (2021) statt?", answer: "Japan (Tokio)", points: 200 },
                { question: "Wie heißt der berühmteste Tennisspieler aus der Schweiz?", answer: "Roger Federer", points: 300 },
                { question: "Wie viele Ringe hat das olympische Symbol?", answer: "5", points: 400 },
                { question: "Welcher Fußballer hat die meisten Weltmeistertitel gewonnen?", answer: "Pelé (3 Titel)", points: 500 }
            ]
        },
        {
            name: "🎵 Musik",
            questions: [
                { question: "Wer komponierte die 9. Sinfonie?", answer: "Ludwig van Beethoven", points: 100 },
                { question: "Wie heißt die berühmteste Band aus Liverpool?", answer: "The Beatles", points: 200 },
                { question: "Welches Instrument hat 88 Tasten?", answer: "Das Klavier", points: 300 },
                { question: "Wer sang 'Thriller'?", answer: "Michael Jackson", points: 400 },
                { question: "Was bedeutet 'forte' in der Musik?", answer: "Laut", points: 500 }
            ]
        },
        {
            name: "🎬 Film & TV",
            questions: [
                { question: "Wie heißt der Zauberer mit der Blitznarbe?", answer: "Harry Potter", points: 100 },
                { question: "Welcher Film gewann 2020 den Oscar für den besten Film?", answer: "Parasite", points: 200 },
                { question: "Wer spielte Iron Man im Marvel Cinematic Universe?", answer: "Robert Downey Jr.", points: 300 },
                { question: "In welchem Jahr erschien der erste Star Wars Film?", answer: "1977", points: 400 },
                { question: "Welcher Regisseur drehte 'Inception' und 'Interstellar'?", answer: "Christopher Nolan", points: 500 }
            ]
        },
        {
            name: "🔬 Wissenschaft",
            questions: [
                { question: "Was ist H2O?", answer: "Wasser", points: 100 },
                { question: "Wie viele Planeten hat unser Sonnensystem?", answer: "8", points: 200 },
                { question: "Was ist die Einheit für elektrische Spannung?", answer: "Volt (V)", points: 300 },
                { question: "Wer entwickelte die Relativitätstheorie?", answer: "Albert Einstein", points: 400 },
                { question: "Was ist die Lichtgeschwindigkeit?", answer: "299.792.458 m/s (ca. 300.000 km/s)", points: 500 }
            ]
        },
        {
            name: "🌳 Natur & Tiere",
            questions: [
                { question: "Was ist das größte Landtier?", answer: "Der Afrikanische Elefant", points: 100 },
                { question: "Wie viele Beine hat eine Spinne?", answer: "8", points: 200 },
                { question: "Welches ist das schnellste Landtier der Welt?", answer: "Der Gepard", points: 300 },
                { question: "Was produzieren Bienen?", answer: "Honig", points: 400 },
                { question: "Wie heißt der Prozess, bei dem Pflanzen Licht in Energie umwandeln?", answer: "Photosynthese", points: 500 }
            ]
        },
        {
            name: "🎨 Kultur & Kunst",
            questions: [
                { question: "Wer malte die Mona Lisa?", answer: "Leonardo da Vinci", points: 100 },
                { question: "In welcher Stadt steht der Eiffelturm?", answer: "Paris", points: 200 },
                { question: "Wer schrieb 'Faust'?", answer: "Johann Wolfgang von Goethe", points: 300 },
                { question: "Was bedeutet 'Renaissance'?", answer: "Wiedergeburt", points: 400 },
                { question: "Welcher spanische Maler gilt als Begründer des Kubismus?", answer: "Pablo Picasso", points: 500 }
            ]
        },
        {
            name: "🏛️ Politik",
            questions: [
                { question: "Wie heißt die aktuelle Bundeskanzlerin/der aktuelle Bundeskanzler?", answer: "Olaf Scholz", points: 100 },
                { question: "Wie viele Mitgliedstaaten hat die Europäische Union?", answer: "27", points: 200 },
                { question: "Was bedeutet 'UNO'?", answer: "United Nations Organization (Vereinte Nationen)", points: 300 },
                { question: "In welcher Stadt ist der Sitz der deutschen Bundesregierung?", answer: "Berlin", points: 400 },
                { question: "Wie viele Artikel hat das deutsche Grundgesetz?", answer: "146", points: 500 }
            ]
        },
        {
            name: "💻 Technik",
            questions: [
                { question: "Was bedeutet 'WWW'?", answer: "World Wide Web", points: 100 },
                { question: "Welches Unternehmen entwickelte das iPhone?", answer: "Apple", points: 200 },
                { question: "Was ist die Abkürzung 'USB'?", answer: "Universal Serial Bus", points: 300 },
                { question: "Wer gründete Microsoft?", answer: "Bill Gates und Paul Allen", points: 400 },
                { question: "Was bedeutet 'AI' oder 'KI'?", answer: "Artificial Intelligence / Künstliche Intelligenz", points: 500 }
            ]
        }
    ]
};

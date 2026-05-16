// MBTI Quiz Data - Questions and Character Profiles

export interface MbtiQuestion {
    id: number;
    question: string;
    optionA: string;
    optionB: string;
    dimension: 'EI' | 'SN' | 'TF' | 'JP'; // Which MBTI dimension this question measures
    // optionA leans toward: E, S, T, J
    // optionB leans toward: I, N, F, P
}

export interface DramaCharacter {
    mbtiType: string;
    typeName: string;
    character: string;
    drama: string;
    image: string;
    traits: string[];
    description: string;
    whyYouMatch: string;
}

// 12 Questions - 3 per dimension
export const mbtiQuestions: MbtiQuestion[] = [
    // E vs I (Energy)
    {
        id: 1,
        question: "At a party or family gathering, you usually...",
        optionA: "Talk to many people and make new friends",
        optionB: "Stick with a few close friends or quietly observe",
        dimension: 'EI'
    },
    {
        id: 2,
        question: "After a long day, you recharge by...",
        optionA: "Going out with friends or calling someone",
        optionB: "Spending time alone with a good drama or book",
        dimension: 'EI'
    },
    {
        id: 3,
        question: "When solving a problem, you prefer to...",
        optionA: "Talk it out with others and brainstorm together",
        optionB: "Think it through quietly on your own first",
        dimension: 'EI'
    },

    // S vs N (Information)
    {
        id: 4,
        question: "When watching a drama, you pay more attention to...",
        optionA: "The realistic details, dialogues, and acting",
        optionB: "The deeper meanings, symbolism, and what could happen",
        dimension: 'SN'
    },
    {
        id: 5,
        question: "You would describe yourself as more...",
        optionA: "Practical and grounded in reality",
        optionB: "Imaginative and full of ideas",
        dimension: 'SN'
    },
    {
        id: 6,
        question: "When making plans, you...",
        optionA: "Focus on what's actually possible right now",
        optionB: "Dream big and think about future possibilities",
        dimension: 'SN'
    },

    // T vs F (Decisions)
    {
        id: 7,
        question: "When a friend asks for advice, you usually...",
        optionA: "Give them the honest, logical solution",
        optionB: "Consider their feelings and support them emotionally",
        dimension: 'TF'
    },
    {
        id: 8,
        question: "In an argument, you value...",
        optionA: "Being right and stating facts",
        optionB: "Keeping harmony and understanding others",
        dimension: 'TF'
    },
    {
        id: 9,
        question: "When making important decisions, you rely more on...",
        optionA: "Logic and objective analysis",
        optionB: "Your heart and how it affects people",
        dimension: 'TF'
    },

    // J vs P (Lifestyle)
    {
        id: 10,
        question: "Your room/workspace is usually...",
        optionA: "Organized and everything has its place",
        optionB: "A bit messy but you know where things are",
        dimension: 'JP'
    },
    {
        id: 11,
        question: "When it comes to deadlines, you...",
        optionA: "Finish early and stick to the schedule",
        optionB: "Work best under pressure, often last minute",
        dimension: 'JP'
    },
    {
        id: 12,
        question: "You prefer your weekends to be...",
        optionA: "Planned out with activities scheduled",
        optionB: "Spontaneous - see what happens!",
        dimension: 'JP'
    }
];

// 16 Drama Characters - One for each MBTI type
export const dramaCharacters: DramaCharacter[] = [
    {
        mbtiType: 'INTJ',
        typeName: 'The Architect',
        character: 'Kashaf',
        drama: 'Zindagi Gulzar Hai',
        image: 'https://upload.wikimedia.org/wikipedia/en/4/4e/Kashaf_Murtaza.jpg',
        traits: ['Strategic', 'Independent', 'Determined', 'Principled'],
        description: 'Kashaf is the ultimate strategist - she mapped out her entire life with determination and didn\'t let anyone derail her goals. Despite all obstacles, she stayed focused and achieved everything through sheer willpower.',
        whyYouMatch: 'Like Kashaf, you\'re incredibly independent and have a clear vision for your life. You don\'t need others\' approval to pursue your goals. You\'re strategic in your thinking and prefer to rely on yourself rather than depend on others.'
    },
    {
        mbtiType: 'INTP',
        typeName: 'The Thinker',
        character: 'Afzal',
        drama: 'Pyaare Afzal',
        image: 'https://i.ytimg.com/vi/Q9Z9Z9Z9Z9Z/maxresdefault.jpg',
        traits: ['Philosophical', 'Unconventional', 'Deep', 'Analytical'],
        description: 'Afzal was a deep thinker who saw the world differently. His philosophical nature and unconventional approach to life made him stand out. He questioned everything and lived by his own rules.',
        whyYouMatch: 'You share Afzal\'s philosophical nature. You love diving deep into ideas and concepts, often getting lost in your own thoughts. You\'re unconventional and don\'t follow the crowd - you carve your own path.'
    },
    {
        mbtiType: 'ENTJ',
        typeName: 'The Commander',
        character: 'Ashar',
        drama: 'Humsafar',
        image: 'https://i.pinimg.com/originals/0a/0a/0a/0a0a0a0a0a0a0a0a0a0a0a0a0a0a0a0a.jpg',
        traits: ['Ambitious', 'Decisive', 'Leader', 'Confident'],
        description: 'Ashar Hussain was born to lead. As the head of a business empire, he made tough decisions with confidence. His ambition and drive pushed him to achieve greatness in both business and personal life.',
        whyYouMatch: 'Like Ashar, you\'re a natural leader. People look to you for guidance and you\'re confident in making tough decisions. You have big ambitions and the drive to achieve them. You inspire others with your vision.'
    },
    {
        mbtiType: 'ENTP',
        typeName: 'The Debater',
        character: 'Zaroon',
        drama: 'Zindagi Gulzar Hai',
        image: 'https://upload.wikimedia.org/wikipedia/en/9/9b/Zaroon_Junaid.jpg',
        traits: ['Witty', 'Charming', 'Argumentative', 'Clever'],
        description: 'Zaroon loved a good debate! His quick wit and charm made him irresistible, even when he was being infuriating. He challenged everyone around him and wasn\'t afraid to speak his mind.',
        whyYouMatch: 'You share Zaroon\'s love for intellectual sparring. You enjoy debates and can argue any side of an issue. Your wit and charm help you connect with people, even when you\'re challenging their views. You\'re never boring!'
    },
    {
        mbtiType: 'INFJ',
        typeName: 'The Advocate',
        character: 'Khirad',
        drama: 'Humsafar',
        image: 'https://i.pinimg.com/originals/1b/1b/1b/1b1b1b1b1b1b1b1b1b1b1b1b1b1b1b1b.jpg',
        traits: ['Compassionate', 'Idealistic', 'Loyal', 'Intuitive'],
        description: 'Khirad Ehsan was the embodiment of quiet strength. Her compassion knew no bounds, and she stayed loyal even when the world turned against her. She saw the good in people and never compromised her values.',
        whyYouMatch: 'Like Khirad, you have deep compassion for others and strong moral values. You\'re intuitive and can sense what others are feeling. You stay loyal to those you love, even when it\'s hard. Your quiet strength inspires others.'
    },
    {
        mbtiType: 'INFP',
        typeName: 'The Mediator',
        character: 'Mushk',
        drama: 'Ishq Murshid',
        image: 'https://i.ytimg.com/vi/mushk_ishq_murshid/maxresdefault.jpg',
        traits: ['Dreamy', 'Romantic', 'Idealistic', 'Creative'],
        description: 'Mushk lives in a world of dreams and possibilities. Her romantic heart and creative spirit make her believe in fairy tales. She sees beauty in everything and everyone around her.',
        whyYouMatch: 'You\'re a romantic at heart, just like Mushk. You believe in true love and happy endings. Your imagination is rich, and you often daydream about possibilities. You have a creative soul that expresses itself in everything you do.'
    },
    {
        mbtiType: 'ENFJ',
        typeName: 'The Protagonist',
        character: 'Meerab',
        drama: 'Tere Bin',
        image: 'https://i.ytimg.com/vi/meerab_tere_bin/maxresdefault.jpg',
        traits: ['Charismatic', 'Empathetic', 'Passionate', 'Inspiring'],
        description: 'Meerab\'s fire and passion are contagious! She stands up for what she believes in and inspires everyone around her. Her empathy helps her connect deeply with others, even her enemies.',
        whyYouMatch: 'Like Meerab, you have a magnetic personality that draws people to you. You\'re passionate about your beliefs and aren\'t afraid to fight for them. You naturally understand others\' feelings and inspire them to be their best.'
    },
    {
        mbtiType: 'ENFP',
        typeName: 'The Campaigner',
        character: 'Haniya',
        drama: 'Suno Chanda',
        image: 'https://i.ytimg.com/vi/haniya_suno_chanda/maxresdefault.jpg',
        traits: ['Enthusiastic', 'Creative', 'Spontaneous', 'Optimistic'],
        description: 'Haniya brings joy wherever she goes! Her enthusiasm is infectious, and her creative solutions to problems always surprise everyone. She sees the bright side of life and spreads positivity.',
        whyYouMatch: 'You share Haniya\'s infectious enthusiasm! Your creativity knows no bounds, and you approach life with optimism. You\'re spontaneous and love trying new things. People love being around you because you make everything more fun.'
    },
    {
        mbtiType: 'ISTJ',
        typeName: 'The Logistician',
        character: 'Fawad',
        drama: 'Dil Ruba',
        image: 'https://i.ytimg.com/vi/fawad_dil_ruba/maxresdefault.jpg',
        traits: ['Dutiful', 'Reliable', 'Traditional', 'Responsible'],
        description: 'Fawad is the rock everyone leans on. His sense of duty and responsibility make him utterly reliable. He values tradition and always does what\'s expected of him, even at personal cost.',
        whyYouMatch: 'Like Fawad, you\'re someone people can always count on. You take your responsibilities seriously and never let others down. You respect traditions and have a strong sense of duty. Your reliability makes you invaluable.'
    },
    {
        mbtiType: 'ISFJ',
        typeName: 'The Defender',
        character: 'Sara',
        drama: 'Mere Humsafar',
        image: 'https://i.ytimg.com/vi/sara_mere_humsafar/maxresdefault.jpg',
        traits: ['Nurturing', 'Protective', 'Selfless', 'Supportive'],
        description: 'Sara is the ultimate protector. Her nurturing nature and selfless love make her put everyone else first. She creates a safe haven for those she loves and defends them fiercely.',
        whyYouMatch: 'You have Sara\'s protective, nurturing spirit. You always put your loved ones first and create a warm, safe environment for them. Your selfless nature means you often sacrifice your own needs for others.'
    },
    {
        mbtiType: 'ESTJ',
        typeName: 'The Executive',
        character: 'Murtasim',
        drama: 'Tere Bin',
        image: 'https://i.ytimg.com/vi/murtasim_tere_bin/maxresdefault.jpg',
        traits: ['Authoritative', 'Direct', 'Principled', 'Organized'],
        description: 'Murtasim Khan runs his domain with iron will and clear principles. He\'s direct, says what he means, and expects the same from others. His authoritative presence commands respect.',
        whyYouMatch: 'Like Murtasim, you\'re a natural leader who takes charge of situations. You\'re direct and honest - no mind games. You have strong principles and stick to them. People respect your authority and clear decision-making.'
    },
    {
        mbtiType: 'ESFJ',
        typeName: 'The Consul',
        character: 'Falak',
        drama: 'Kabhi Main Kabhi Tum',
        image: 'https://i.ytimg.com/vi/falak_kmkt/maxresdefault.jpg',
        traits: ['Caring', 'Social', 'Harmony-seeking', 'Supportive'],
        description: 'Falak is the heart of her family and social circle. She cares deeply about everyone\'s well-being and works tirelessly to maintain harmony. Her warmth makes everyone feel welcome.',
        whyYouMatch: 'You share Falak\'s caring, social nature. You\'re the one who holds groups together and makes sure everyone is okay. You seek harmony in relationships and go out of your way to support others.'
    },
    {
        mbtiType: 'ISTP',
        typeName: 'The Virtuoso',
        character: 'Danish',
        drama: 'Mere Paas Tum Ho',
        image: 'https://i.ytimg.com/vi/danish_mpth/maxresdefault.jpg',
        traits: ['Practical', 'Observant', 'Independent', 'Calm'],
        description: 'Danish was a man of few words but deep observation. His practical approach to life and calm demeanor made him handle crises with remarkable composure. He acted rather than talked.',
        whyYouMatch: 'Like Danish, you\'re a person of action rather than words. You observe situations carefully before acting. You\'re practical and independent, preferring to figure things out on your own. Your calm nature helps in crises.'
    },
    {
        mbtiType: 'ISFP',
        typeName: 'The Adventurer',
        character: 'Anaya',
        drama: 'Ishq Murshid',
        image: 'https://i.ytimg.com/vi/anaya_ishq_murshid/maxresdefault.jpg',
        traits: ['Gentle', 'Artistic', 'Free-spirited', 'Sensitive'],
        description: 'Anaya has an artistic soul and a gentle heart. She\'s sensitive to beauty in all forms and expresses herself through her creativity. Her free spirit refuses to be confined by conventions.',
        whyYouMatch: 'You have Anaya\'s artistic, sensitive nature. You appreciate beauty in all its forms and have a creative way of expressing yourself. You value your freedom and don\'t like being boxed in by rules.'
    },
    {
        mbtiType: 'ESTP',
        typeName: 'The Entrepreneur',
        character: 'Mustafa',
        drama: 'Kabhi Main Kabhi Tum',
        image: 'https://i.ytimg.com/vi/mustafa_kmkt/maxresdefault.jpg',
        traits: ['Bold', 'Action-oriented', 'Charismatic', 'Adaptable'],
        description: 'Mustafa is all about action! He doesn\'t wait around - he makes things happen. His boldness and charisma help him navigate any situation, and he adapts quickly to whatever life throws at him.',
        whyYouMatch: 'Like Mustafa, you\'re a doer, not a planner. You\'re bold and jump into action without overthinking. Your charisma helps you charm your way through situations. You adapt quickly and thrive on excitement.'
    },
    {
        mbtiType: 'ESFP',
        typeName: 'The Entertainer',
        character: 'Sharjeena',
        drama: 'Parizaad',
        image: 'https://i.ytimg.com/vi/sharjeena_parizaad/maxresdefault.jpg',
        traits: ['Fun-loving', 'Spontaneous', 'Vibrant', 'Expressive'],
        description: 'Sharjeena lights up every room she enters! Her vibrant personality and love for life make her the center of attention. She lives in the moment and brings joy to everyone around her.',
        whyYouMatch: 'You share Sharjeena\'s vibrant, fun-loving spirit! You\'re the life of the party and people are naturally drawn to your energy. You live in the moment and don\'t worry too much about tomorrow. Your expressiveness is your superpower!'
    }
];

// Helper function to calculate MBTI from answers
export const calculateMbti = (answers: Record<number, 'A' | 'B'>): string => {
    let e = 0, i = 0, s = 0, n = 0, t = 0, f = 0, j = 0, p = 0;

    mbtiQuestions.forEach((q) => {
        const answer = answers[q.id];
        if (!answer) return;

        switch (q.dimension) {
            case 'EI':
                answer === 'A' ? e++ : i++;
                break;
            case 'SN':
                answer === 'A' ? s++ : n++;
                break;
            case 'TF':
                answer === 'A' ? t++ : f++;
                break;
            case 'JP':
                answer === 'A' ? j++ : p++;
                break;
        }
    });

    return `${e >= i ? 'E' : 'I'}${s >= n ? 'S' : 'N'}${t >= f ? 'T' : 'F'}${j >= p ? 'J' : 'P'}`;
};

// Get character by MBTI type
export const getCharacterByMbti = (mbtiType: string): DramaCharacter | undefined => {
    return dramaCharacters.find(c => c.mbtiType === mbtiType);
};

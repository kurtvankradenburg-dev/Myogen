export const quizCategories = [
  { id: 'muscular', name: 'Muscular System', description: 'Skeletal muscles, fiber types, hypertrophy', icon: '💪' },
  { id: 'neuromuscular', name: 'Neuromuscular System', description: 'Motor units, recruitment, neural adaptations', icon: '⚡' },
  { id: 'biomechanics', name: 'Biomechanics', description: 'Movement science, leverage, joint mechanics', icon: '📐' },
  { id: 'skeletal', name: 'Skeletal System', description: 'Bones, joints, limb structure', icon: '🦴' },
  { id: 'cardiovascular', name: 'Cardiovascular System', description: 'Heart, blood vessels, circulation', icon: '❤️' },
  { id: 'endocrine', name: 'Endocrine System', description: 'Hormones, adaptation signaling', icon: '🧬' },
  { id: 'recovery', name: 'Sleep & Recovery', description: 'Rest, adaptation, stress management', icon: '🌙' },
];

export const quizQuestions = [
  // ===== BIOMECHANICS =====
  {
    id: 1, category: 'biomechanics', difficulty: 'intermediate',
    question: "At what range of shoulder flexion does the anterior deltoid have maximum leverage?",
    options: ["30–60°", "0–30°", "60–90°", "90–120°"],
    correct: 1,
    explanation: "The anterior deltoid has maximum moment arm (leverage) during shoulder flexion between 0–30°. Beyond 30°, the upper pectoralis begins to dominate the shoulder flexion moment."
  },
  {
    id: 2, category: 'biomechanics', difficulty: 'intermediate',
    question: "When using an elbow cuff instead of a wrist grip on a cable lateral raise, what happens to the moment arm?",
    options: ["It increases, making the lift harder", "It decreases, providing more mechanical advantage", "It stays the same", "It depends on the cable angle"],
    correct: 1,
    explanation: "Attaching the cuff to the elbow brings the load closer to the joint axis, shortening the moment arm. A shorter moment arm means greater mechanical advantage, allowing more weight to be lifted — which provides greater overload stimulus."
  },
  {
    id: 3, category: 'biomechanics', difficulty: 'advanced',
    question: "For optimal upper pectoral cable fly, at what cable height should the pulley be set?",
    options: ["At floor level", "At a height where arms start at approximately 30° shoulder flexion", "At shoulder height", "As high as possible"],
    correct: 1,
    explanation: "Setting the cable so arms begin at ~30° shoulder flexion ensures you avoid the 0–30° zone where the anterior delt dominates. From 30° upward, the upper pectoralis clavicular head has superior leverage, maximizing pec stimulation."
  },
  {
    id: 4, category: 'biomechanics', difficulty: 'beginner',
    question: "What is a moment arm (torque arm)?",
    options: ["The length of the muscle belly", "The perpendicular distance from the line of force to the joint's axis of rotation", "The angle of pull of the muscle", "The muscle's cross-sectional area"],
    correct: 1,
    explanation: "A moment arm is the perpendicular distance from the joint axis of rotation to the line of action of the force. Longer moment arms reduce mechanical advantage; shorter moment arms increase it."
  },
  {
    id: 5, category: 'biomechanics', difficulty: 'advanced',
    question: "Why does converting a lat pulldown from a 3-joint to a 2-joint exercise (using an elbow cuff) increase target muscle motor unit recruitment?",
    options: ["More muscle groups are activated overall", "Forearm and wrist flexors no longer compete for neural drive, allowing the lat to recruit more motor units", "The weight becomes heavier", "The cable angle changes"],
    correct: 1,
    explanation: "In a standard grip pulldown, neural drive is distributed across shoulder, elbow, and wrist joints. By eliminating the wrist/hand joint via cuff, forearm and grip muscles no longer compete. This allows the nervous system to direct more motor unit recruitment to the latissimus dorsi."
  },
  {
    id: 23, category: 'biomechanics', difficulty: 'advanced',
    question: "In a sagittal plane cable row using an elbow cuff instead of a handle, what is the primary mechanical benefit?",
    options: ["Greater lat stretch at full extension", "Elimination of wrist/forearm joints reduces neural competition, increasing lat and rhomboid MUR", "The movement becomes safer for the shoulder", "Cable tension is distributed more evenly"],
    correct: 1,
    explanation: "Using an elbow cuff in cable rows converts a 3-joint (wrist-elbow-shoulder) to a 2-joint (elbow-shoulder) movement. Forearm flexors and grip muscles no longer compete for motor drive. This allows the nervous system to maximize motor unit recruitment in the latissimus dorsi, rhomboids, and rear deltoids."
  },
  {
    id: 26, category: 'biomechanics', difficulty: 'intermediate',
    question: "What happens to pectoral muscle leverage when the shoulder goes from 30° to 90° of horizontal adduction?",
    options: ["Leverage decreases because the muscle shortens", "The pec major maintains near-peak leverage through most of horizontal adduction", "The anterior delt takes over completely", "Mechanical advantage stays identical throughout"],
    correct: 1,
    explanation: "The pectoralis major (sternal head) maintains favorable leverage through horizontal adduction until approximately 90°+. This is why cable crossovers through full adduction target the pec effectively — the resistance moment arm stays long through the working range."
  },
  {
    id: 27, category: 'biomechanics', difficulty: 'beginner',
    question: "Which joint position maximizes the bicep brachii's moment arm during elbow flexion?",
    options: ["Full extension (0°)", "Approximately 80–100° of elbow flexion", "Full flexion (145°+)", "The moment arm is constant throughout"],
    correct: 1,
    explanation: "The bicep brachii achieves maximum moment arm for elbow flexion at approximately 80–100° of elbow flexion. This is why the midpoint of a curl feels hardest under free weight resistance — peak torque from the muscle coincides with peak external torque demand."
  },
  // ===== NEUROMUSCULAR =====
  {
    id: 6, category: 'neuromuscular', difficulty: 'beginner',
    question: "What is the size principle of motor unit recruitment?",
    options: ["Largest motor units are always recruited first", "Motor units are recruited from smallest to largest based on force demand", "All motor units fire simultaneously", "Only Type II fibers are used during resistance training"],
    correct: 1,
    explanation: "Henneman's size principle states that motor units are recruited in order from smallest (Type I, slow-twitch, low force) to largest (Type IIx, fast-twitch, high force) as force requirements increase. This ensures efficient energy use."
  },
  {
    id: 7, category: 'neuromuscular', difficulty: 'intermediate',
    question: "What triggers the release of calcium ions during muscle contraction?",
    options: ["Direct mechanical stretch of the muscle", "An action potential traveling along the T-tubule, triggering sarcoplasmic reticulum release", "Oxygen binding to myoglobin", "ATP hydrolysis in the cytoplasm"],
    correct: 1,
    explanation: "Action potentials travel along the sarcolemma and into T-tubules, triggering ryanodine receptors on the sarcoplasmic reticulum. This releases Ca²⁺ into the cytoplasm, which binds to troponin C, moving tropomyosin to expose actin binding sites for cross-bridge cycling."
  },
  {
    id: 8, category: 'neuromuscular', difficulty: 'intermediate',
    question: "What is the primary neural adaptation to resistance training in the first 4–8 weeks?",
    options: ["Significant muscle fiber hypertrophy", "Increased motor unit recruitment, rate coding, and synchronization", "Tendon thickening", "Increased satellite cell proliferation"],
    correct: 1,
    explanation: "In early training, strength gains primarily come from neural adaptations: improved motor unit recruitment, increased rate coding (firing frequency), and better synchronization. Structural hypertrophy becomes dominant after ~8–12 weeks."
  },
  {
    id: 9, category: 'neuromuscular', difficulty: 'advanced',
    question: "When performing high-volume training (many sets per week for a muscle), why is training to 1 RIR preferable to absolute failure?",
    options: ["1 RIR gives the same stimulus with better fatigue management across the weekly volume", "Failure training causes muscle tears", "1 RIR activates more Type I fibers", "It's harder to reach failure with heavy weights"],
    correct: 0,
    explanation: "At high weekly volumes, accumulating fatigue limits subsequent set quality. Training to 1 RIR preserves neural freshness to maintain high-quality reps across all sets. The stimulus-to-fatigue ratio is superior. At low volumes (1 set/week), maximizing proximity to failure is critical."
  },
  {
    id: 10, category: 'neuromuscular', difficulty: 'beginner',
    question: "What is an EMG (electromyography) reading measuring?",
    options: ["Blood flow to the muscle", "Electrical activity produced by motor units firing", "Oxygen consumption of muscle fibers", "Mechanical force output"],
    correct: 1,
    explanation: "EMG measures the electrical activity generated by motor units as they depolarize. Higher EMG amplitude generally indicates greater motor unit recruitment and activation. It's used in research to compare muscle activation between exercises."
  },
  {
    id: 24, category: 'neuromuscular', difficulty: 'advanced',
    question: "What is rate coding in motor unit physiology?",
    options: ["The rate at which new motor units are created", "The frequency at which action potentials fire within individual motor units to modulate force output", "The speed at which calcium is removed from the sarcomere", "The metabolic rate of Type II fibers"],
    correct: 1,
    explanation: "Rate coding (firing rate) is the second mechanism of force modulation after recruitment. Once a motor unit is recruited, increasing its firing frequency increases force via temporal summation — faster action potentials cause more complete tetanic fusion, generating higher sustained force."
  },
  {
    id: 28, category: 'neuromuscular', difficulty: 'intermediate',
    question: "What is the neuromuscular junction?",
    options: ["The point where two bones meet at a joint", "The synapse between a motor neuron's axon terminal and a muscle fiber", "The connective tissue surrounding a muscle fascicle", "The area where the muscle inserts onto the tendon"],
    correct: 1,
    explanation: "The neuromuscular junction (NMJ) is the specialized synapse where a motor neuron communicates with a muscle fiber. The neuron releases acetylcholine (ACh) which binds to receptors on the muscle, generating an end-plate potential that triggers an action potential and ultimately muscle contraction."
  },
  {
    id: 29, category: 'neuromuscular', difficulty: 'advanced',
    question: "What is the Golgi tendon organ (GTO) and its role in exercise?",
    options: ["A muscle receptor that detects stretch velocity", "A tendon receptor that inhibits contraction when tension exceeds a threshold, preventing injury", "The point where muscle fiber meets tendon", "A receptor that signals fatigue to the CNS"],
    correct: 1,
    explanation: "The Golgi tendon organ is a mechanoreceptor located at the muscle-tendon junction. It detects high tension and triggers autogenic inhibition via Ib afferents, temporarily reducing motor neuron drive to prevent musculotendinous injury. With training, GTO inhibition thresholds can increase, allowing greater force expression."
  },
  // ===== MUSCULAR SYSTEM =====
  {
    id: 11, category: 'muscular', difficulty: 'beginner',
    question: "What is the primary mechanism of skeletal muscle hypertrophy?",
    options: ["Increased number of muscle fibers (hyperplasia)", "Increased cross-sectional area of existing muscle fibers via myofibril addition", "Water retention in the muscle belly", "Increased glycogen storage"],
    correct: 1,
    explanation: "Hypertrophy primarily occurs through myofibrillar growth — adding sarcomeres in parallel increases the cross-sectional area of existing fibers. This is driven by mechanical tension, satellite cell activation, and protein synthesis upregulation. Hyperplasia (new fiber creation) is minimal in humans."
  },
  {
    id: 12, category: 'muscular', difficulty: 'intermediate',
    question: "What distinguishes Type IIx muscle fibers from Type I fibers?",
    options: ["Type IIx have more mitochondria", "Type IIx are fast-twitch, glycolytic, fatigue quickly, generate high force", "Type IIx are recruited first during light loads", "Type IIx only activate during endurance exercise"],
    correct: 1,
    explanation: "Type IIx (fast-twitch glycolytic) fibers: high peak force, fast contraction velocity, few mitochondria, fatigue rapidly. They're recruited last (highest threshold) during maximal efforts near failure. Type I (slow-twitch): low force, fatigue-resistant, many mitochondria, recruited first."
  },
  {
    id: 13, category: 'muscular', difficulty: 'intermediate',
    question: "What is the length-tension relationship in skeletal muscle?",
    options: ["Muscle force is constant regardless of length", "Peak force occurs at an optimal length where maximum actin-myosin overlap occurs", "Muscles generate most force when fully shortened", "Force increases linearly as muscle stretches"],
    correct: 1,
    explanation: "The length-tension relationship describes how force production varies with muscle length. Peak active force occurs at optimal sarcomere length (~2.0–2.2 μm), where actin-myosin cross-bridge overlap is maximized. At shorter or longer lengths, fewer cross-bridges can form."
  },
  {
    id: 14, category: 'muscular', difficulty: 'advanced',
    question: "Why does training the upper pectoral (clavicular head) require specific attention to cable/pulley angles?",
    options: ["The clavicular head only activates with heavy weights", "The clavicular head's fiber orientation dictates that low-to-high movement vectors (30–120° shoulder flexion) maximally load it", "Upper chest activation requires declined pressing", "Cable angle doesn't affect fiber recruitment"],
    correct: 1,
    explanation: "The clavicular head fibers run at an upward angle from the humerus. Their moment arm for shoulder flexion is greatest in the 30–120° range. Setting cables low (starting at ~30° shoulder flexion, moving upward) aligns resistance with the fiber's optimal working range."
  },
  {
    id: 15, category: 'muscular', difficulty: 'beginner',
    question: "What is the optimal rep range for maximal muscle hypertrophy according to current exercise science?",
    options: ["1–4 reps", "5–12 reps", "15–20 reps", "25–30 reps"],
    correct: 1,
    explanation: "The 5–12 rep range (at ~65–85% 1RM) is well-established for maximizing hypertrophy. This range optimally combines mechanical tension, metabolic stress, and time under tension. However, research shows 6–30 reps can all build muscle if taken close to failure."
  },
  {
    id: 25, category: 'muscular', difficulty: 'intermediate',
    question: "What is active insufficiency in a bi-articular muscle?",
    options: ["When a muscle is too weak to generate force", "When a multi-joint muscle is shortened at both joints simultaneously, reducing its ability to generate force", "When a muscle tears during training", "The inability to reach full ROM due to joint restriction"],
    correct: 1,
    explanation: "Active insufficiency occurs in bi-articular muscles when they are shortened at both joints they cross. Example: biceps brachii — fully flexing the elbow while shoulder flexed reduces the bicep's ability to generate force because it approaches its shortest functional length."
  },
  {
    id: 30, category: 'muscular', difficulty: 'intermediate',
    question: "What role do satellite cells play in muscle adaptation?",
    options: ["They carry oxygen to the muscle fibers", "They are muscle stem cells that donate nuclei to hypertrophying fibers, enabling greater protein synthesis capacity", "They form the connective tissue sheath around fascicles", "They regulate calcium release from the SR"],
    correct: 1,
    explanation: "Satellite cells are muscle-specific stem cells located between the sarcolemma and basal lamina. After mechanical stress, they activate, proliferate, and can donate nuclei to existing muscle fibers (myonuclear accretion). More nuclei = more genetic machinery for protein synthesis = greater hypertrophy potential."
  },
  // ===== CARDIOVASCULAR =====
  {
    id: 16, category: 'cardiovascular', difficulty: 'beginner',
    question: "What physiological adaptation allows trained athletes to have lower resting heart rates?",
    options: ["Reduced blood volume", "Increased stroke volume from cardiac hypertrophy", "Faster AV node conduction", "More red blood cells"],
    correct: 1,
    explanation: "Endurance training causes eccentric cardiac hypertrophy — the left ventricle's chambers enlarge, increasing stroke volume (blood per beat). With more blood per beat, fewer beats per minute are needed to maintain cardiac output, resulting in lower resting HR (bradycardia)."
  },
  {
    id: 17, category: 'cardiovascular', difficulty: 'intermediate',
    question: "What is the primary role of the Frank-Starling mechanism in cardiac output during exercise?",
    options: ["It reduces heart rate under stress", "Increased venous return stretches the ventricle, increasing stroke volume proportionally", "It controls blood pressure via baroreceptors", "It regulates oxygen-hemoglobin affinity"],
    correct: 1,
    explanation: "The Frank-Starling mechanism: as venous return increases during exercise (skeletal muscle pumping blood back), the ventricle is stretched more. Increased preload causes stronger contraction, automatically increasing stroke volume to match return."
  },
  {
    id: 31, category: 'cardiovascular', difficulty: 'intermediate',
    question: "What is VO2 max and why is it significant?",
    options: ["The maximum CO2 a person can exhale per minute", "The maximum rate of oxygen consumption during maximal exercise — the gold standard of aerobic capacity", "The oxygen saturation level at rest", "The tidal volume at peak exercise"],
    correct: 1,
    explanation: "VO2 max (maximal oxygen uptake) is the maximum rate at which the body can consume oxygen during exhaustive exercise. It reflects the integrated capacity of the cardiovascular, pulmonary, and muscular systems. It's the strongest predictor of endurance performance and correlates strongly with all-cause mortality."
  },
  // ===== ENDOCRINE =====
  {
    id: 18, category: 'endocrine', difficulty: 'intermediate',
    question: "What is the primary anabolic hormonal response to heavy resistance training?",
    options: ["Sustained testosterone elevation lasting 24+ hours", "Acute post-exercise surges in testosterone, GH, and IGF-1 that upregulate protein synthesis", "Cortisol dominance that drives muscle building", "Permanent upregulation of insulin sensitivity"],
    correct: 1,
    explanation: "Heavy compound resistance training causes acute (30–60 minute) elevations in testosterone, growth hormone, and IGF-1. These signals upregulate protein synthesis, activate satellite cells, and create an anabolic environment. The acute spike primarily drives adaptation signaling."
  },
  {
    id: 19, category: 'endocrine', difficulty: 'advanced',
    question: "How does chronically elevated cortisol impair muscle development?",
    options: ["By increasing myosin heavy chain synthesis", "By promoting muscle protein catabolism, inhibiting protein synthesis, and antagonizing testosterone signaling", "By reducing blood glucose below functional levels", "Cortisol has no effect on muscle tissue"],
    correct: 1,
    explanation: "Cortisol activates muscle protein degradation pathways (ubiquitin-proteasome), inhibits mTOR signaling (reducing protein synthesis), and antagonizes androgen receptor sensitivity. Chronically elevated cortisol (overtraining, poor sleep, high life stress) creates a catabolic environment opposing hypertrophy."
  },
  {
    id: 32, category: 'endocrine', difficulty: 'intermediate',
    question: "What is the role of insulin in muscle growth and recovery?",
    options: ["Insulin only manages blood glucose and has no anabolic role", "Insulin is a potent anabolic hormone that stimulates protein synthesis, inhibits protein breakdown, and drives glucose and amino acid uptake into muscle", "Insulin primarily signals fat storage only", "Insulin competes with testosterone at the androgen receptor"],
    correct: 1,
    explanation: "Insulin activates the PI3K/Akt/mTOR signaling cascade in muscle cells, stimulating protein synthesis. It also suppresses protein breakdown (anti-catabolic) and facilitates glucose and amino acid transport into muscle cells. Post-workout insulin elevation (via carbohydrate + protein intake) maximizes the anabolic window."
  },
  // ===== SLEEP & RECOVERY =====
  {
    id: 20, category: 'recovery', difficulty: 'beginner',
    question: "During which sleep stage does the majority of growth hormone secretion occur?",
    options: ["REM sleep", "Slow-wave sleep (SWS / Stage 3 NREM)", "Light NREM sleep (Stage 1–2)", "The transition between REM and NREM"],
    correct: 1,
    explanation: "Growth hormone is pulsatilely secreted, with the largest pulse occurring within 1–2 hours of sleep onset during slow-wave sleep (SWS/deep sleep). This GH pulse is critical for muscle protein synthesis, fat mobilization, and tissue repair. Sleep deprivation significantly blunts this response."
  },
  {
    id: 21, category: 'recovery', difficulty: 'intermediate',
    question: "What is the recommended sleep duration for optimal athletic recovery and adaptation?",
    options: ["5–6 hours", "7–9 hours", "10–12 hours", "Less than 5 hours with naps"],
    correct: 1,
    explanation: "7–9 hours of quality sleep is the evidence-based recommendation for adults, with athletes potentially benefiting from the upper end (8–9h+). Sleep is when the majority of growth hormone is secreted, muscle protein synthesis peaks, and neural consolidation occurs."
  },
  {
    id: 33, category: 'recovery', difficulty: 'advanced',
    question: "What is the role of mTOR in post-exercise muscle protein synthesis?",
    options: ["mTOR degrades damaged proteins after training", "mTOR (mechanistic target of rapamycin) is a central kinase that integrates mechanical, hormonal, and nutritional signals to upregulate ribosomal protein synthesis", "mTOR primarily regulates fat metabolism post-exercise", "mTOR only activates during sleep"],
    correct: 1,
    explanation: "mTORC1 is the master regulator of muscle protein synthesis. It integrates three key signals: mechanical tension (via mechano-sensors), hormonal input (insulin, IGF-1), and nutrient availability (leucine from dietary protein). All three maximally stimulate mTORC1 together, which is why training + protein + adequate recovery is synergistic."
  },
  // ===== SKELETAL =====
  {
    id: 22, category: 'skeletal', difficulty: 'beginner',
    question: "How do longer clavicles (collarbones) affect shoulder width and pressing leverage?",
    options: ["Longer clavicles narrow shoulder width", "Longer clavicles create wider shoulder width and generally provide better pressing leverage in horizontal movements", "Clavicle length has no effect on strength", "Only humerus length matters for pressing"],
    correct: 1,
    explanation: "Clavicle length determines the lateral position of the shoulder joint. Longer clavicles push the glenohumeral joint further laterally, creating wider shoulders. This also affects pressing leverage — wider shoulders influence horizontal adduction distance in chest pressing."
  },
  {
    id: 34, category: 'skeletal', difficulty: 'intermediate',
    question: "How does femur length affect squat biomechanics?",
    options: ["Longer femurs make squatting easier by lowering the center of gravity", "Longer femurs require greater forward trunk lean to maintain balance, shifting more load to the lower back and hip extensors", "Femur length has no effect on squat mechanics", "Longer femurs allow more upright squatting"],
    correct: 1,
    explanation: "Individuals with longer femurs (relative to torso length) must lean forward more in a squat to keep the center of mass over the base of support. This increases the moment arm at the hip and reduces it at the knee, shifting the mechanical demand toward hip extensors (glutes, hamstrings) over quad dominance."
  },
  {
    id: 35, category: 'skeletal', difficulty: 'advanced',
    question: "What is the acetabular depth and hip socket orientation's effect on squat depth?",
    options: ["All hip sockets are structurally identical, so depth is irrelevant", "Shallow or more anterolaterally-oriented acetabula allow greater hip flexion ROM before femoroacetabular impingement", "Deeper hip sockets always allow more squat depth", "Only femoral neck angle matters for squat depth"],
    correct: 1,
    explanation: "Hip socket (acetabular) depth, orientation, and femoral neck angle (anteversion/retroversion) are major determinants of squat depth potential. Shallower sockets and more anterolateral orientations allow greater hip flexion ROM before the femoral neck contacts the acetabular rim (FAI). This is why individual squat depth varies significantly and isn't solely a flexibility issue."
  },
];

import { useState, useRef, useEffect } from 'react';
import { Dna, Scan, Brain, Zap, Crown, Send, Plus, LayoutDashboard, User } from 'lucide-react';
import { getAuthToken } from '../authToken';
import MyogenLogo from '../components/MyogenLogo';

const FREE_LIMIT = 15;

function loadChats(key = 'myogen_chats') {
  try {
    const saved = localStorage.getItem(key);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}
  return [{ id: 1, title: 'New chat', messages: [] }];
}

const SYSTEM_PROMPT = `You are Myogen's Scientific Knowledge Engine — an elite, multidisciplinary expert combining the knowledge of a senior biomedical researcher, PhD biomechanics specialist, neuromuscular scientist, evidence-based strength coach, and sports nutritionist.

ALWAYS be precise and scientific. Never use hashtags. Never claim to provide medical advice. Always educational.

FORMATTING — THIS IS MANDATORY: Every single response must be written entirely in flowing prose paragraphs. NEVER use bullet points, dashes, numbered lists, or any list format in your responses under any circumstances. Even when describing multiple supplements, multiple exercises, or multiple tips — write them as connected sentences within paragraphs, not as lists. Each paragraph covers one complete idea. Separate paragraphs with a blank line. Responses should feel like reading a high-quality science article, not a listicle.

LONG ANSWER MODE (default): Comprehensive explanation with all relevant mechanisms, physiology, leverage angles, and biomechanics. Minimum 2 well-developed paragraphs.

SHORT ANSWER MODE: Give ONE direct, precise answer followed by ONE primary mechanistic reason. Maximum 3 sentences in a single paragraph. Still no lists.

CONVERSATION MEMORY: The conversation history is included in every request. When the user references something from earlier in the chat — a muscle group they mentioned, a program they described, a goal they stated, a previous question — you MUST recall and build on it explicitly. Never ask the user to repeat themselves. Treat the full conversation as one continuous session.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CABLE SETUP — CRITICAL DISTINCTIONS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Always specify the correct cable height for the intended joint action. For shoulder ABDUCTION (lateral raises, middle delt): cable set LOW at ankle/hip level, arm pulls outward and upward — this creates an upward line of pull that resists abduction through the full range. For shoulder horizontal ADDUCTION (chest fly, upper chest cable fly): cable set LOW for upper chest (line of pull upward = shoulder flexion + adduction toward clavicular pec), cable at shoulder height for mid chest (pure horizontal adduction), cable HIGH for lower chest (line of pull downward = adduction toward sternal/lower pec). For shoulder horizontal ABDUCTION (rear delt fly, face pull): cable set HIGH, arms pull outward and backward — this creates resistance against horizontal abduction. For shoulder FLEXION (front raise, anterior delt): cable set LOW at hip level, arm pulls straight forward and upward. Never confuse abduction and adduction cable setups — they target opposite movement patterns and opposite muscle groups.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
LOADING TOOLS — HANDLES vs CUFFS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Handle-based loading is the default for most exercises. Cuff-based loading (wrist cuff or elbow cuff) should be recommended when grip fatigue or forearm strength is limiting performance and reducing stimulus on the target muscle, when the goal is greater isolation of the target muscle by removing grip-related co-activation, or when resistance can be applied closer to the working joint to improve alignment with the target muscle's line of pull. Do NOT claim cuffs inherently increase motor unit recruitment — they are a tool to modify resistance application and remove limiting factors, not a primary stimulus driver.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PER-MUSCLE LEVERAGE & BIOMECHANICS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

CHEST — CLAVICULAR (UPPER) PECTORALIS MAJOR:
Primary joint actions are shoulder flexion and horizontal adduction. The clavicular head has its greatest mechanical leverage — meaning its moment arm is longest and torque demand is highest — during approximately 30° to 120° of shoulder flexion combined with horizontal adduction. Below 30° the muscle is too shortened in the horizontal plane to generate meaningful tension; above 120° anterior deltoid dominance increases and pec leverage declines. The optimal cable setup is LOW (ankle to hip height), pulling upward at roughly 30–45° incline, which aligns the line of pull with the clavicular fibers' orientation from the clavicle toward the humerus. A press is not inherently worse than a fly — presses allow greater absolute load and can produce significant hypertrophy — but they distribute mechanical stress across more muscle groups and accumulate systemic fatigue faster, reducing the stimulus-to-fatigue ratio specifically for the clavicular head. Cuffs at the elbow or forearm can be used to reduce arm-muscle dominance and bring resistance closer to the shoulder joint.

CHEST — STERNAL (MID) PECTORALIS MAJOR:
Primary joint action is horizontal adduction with the arm near shoulder height (approximately 70°–100° of shoulder flexion). The sternal head has its greatest leverage when the cable is set at shoulder height, creating a purely horizontal line of pull directly opposing horizontal adduction. At this height the moment arm is maximised throughout the mid-range of the movement. Going significantly above or below shoulder height shifts emphasis toward clavicular or lower pec respectively.

CHEST — LOWER PECTORALIS MAJOR (STERNAL/COSTAL LOWER FIBRES):
The lower fibres run from the lower sternum and ribs upward to the humerus, meaning their line of pull is upward and inward. To resist this, the cable must be set HIGH (above shoulder), creating a downward line of pull that opposes the lower pec's adduction and slight shoulder extension function. Peak leverage occurs roughly between 0° and 60° of shoulder flexion as the arm moves from slightly extended to level. The cable high crossover or high cable fly is the primary recommendation.

ANTERIOR DELTOID (FRONT DELT):
Primary joint action is shoulder flexion with minimal horizontal adduction. The anterior delt has its greatest mechanical leverage during approximately 60°–100° of shoulder flexion, where the moment arm from the anterior acromion to the line of resistance is longest. Below 30° the muscle is shortened and poorly loaded; beyond 120° the supraspinatus and upper traps assist significantly. To isolate the anterior delt away from the pectoralis, horizontal adduction must be minimised — the arm should travel forward in the sagittal plane, not across the body. Cable setup: LOW at hip level, performing a straight forward and upward raise (shoulder flexion only). Keeping the elbow slightly soft and the palm facing down or inward maintains anterior delt involvement without excessive bicep contribution.

LATERAL (MIDDLE) DELTOID:
Primary joint action is shoulder abduction in the frontal plane. The lateral deltoid is at a mechanical disadvantage — near-zero leverage — when the arm hangs at the side (0° abduction) because the muscle line of pull is nearly parallel to the line of gravity or cable resistance. Leverage builds rapidly from 15°–30° of abduction and peaks around 60°–90°, where the moment arm from the lateral acromion to the resistance vector is greatest. Beyond 90° of abduction the supraspinatus and upper trapezius increasingly assist, reducing isolated lateral delt stimulus. Cable setup: LOW at ankle or hip level, arm pulling outward and upward (shoulder abduction). Dumbbells also work well but have an ascending strength curve that poorly matches the delt's ascending leverage curve — a cable set LOW more evenly loads the muscle through its effective range. Slight forward lean (~15°–20°) can shift the torque direction to better match the lateral fibre orientation.

POSTERIOR DELTOID:
Primary joint action is shoulder horizontal abduction (pulling the arm rearward from the front, across the body's horizontal plane). The posterior delt reaches peak mechanical leverage during approximately 60°–100° of horizontal abduction from the front-facing position. This is the opposite movement direction from the chest fly — the arm moves outward and backward, not inward. Cable setup: HIGH pulley, both arms pulling outward and backward simultaneously (rear delt cable fly or face pull). In a face pull the elbow flares high and out, emphasising horizontal abduction over pure extension. Using a rope attachment allows bilateral external rotation to be added at end range, further engaging the infraspinatus and teres minor alongside the posterior delt.

LATISSIMUS DORSI:
Primary joint actions are shoulder extension, adduction, and internal rotation. The lats are a large fan-shaped muscle originating from the thoracolumbar fascia and lower ribs, inserting on the humerus. They have their greatest mechanical stretch — and therefore the highest potential for mechanical tension — when the arm is fully elevated overhead (approximately 150°–180° of shoulder flexion/elevation), which is the starting position of a pulldown or the top of a pull-up. The moment arm for shoulder extension peaks around 90°–120° of shoulder elevation, meaning the lats produce the most torque through the early-to-mid pull phase. Pulling from full overhead extension all the way to approximately 30°–40° of shoulder angle (elbow near or past the hip) captures the most productive range. Wide grip emphasises the lat's adduction function; neutral or underhand grip adds bicep contribution and can allow slightly more range. Straight-arm pulldowns isolate the extension function of the lat with elbow locked, maximising lat-specific tension at the expense of load capacity.

BICEPS BRACHII:
Primary joint actions are elbow flexion and forearm supination; the short head also assists shoulder flexion while the long head assists with the arm slightly behind the body. The greatest mechanical leverage for elbow flexion occurs at approximately 80°–100° of elbow flexion — the point where the forearm is roughly perpendicular to the direction of the resistance vector, maximising the moment arm from the elbow joint to the line of pull. At full extension (0° elbow flexion) the moment arm is near zero, meaning the muscle is in its most stretched position but under very little torque — an important distinction between length and load. At full flexion the muscle shortens to a point of reduced leverage as well. A standing cable curl from a LOW pulley closely matches the ascending moment arm profile of the bicep through its mid-range. Preacher curls and spider curls shift the peak tension toward the stretched position (bottom of the movement) by placing the upper arm on a support, which increases time under load in the lengthened state and may enhance hypertrophic stimulus. Incline dumbbell curls place the arm behind the torso, fully stretching the long head of the bicep across both the elbow and shoulder — this increases long head mechanical loading but reduces short head contribution.

TRICEPS BRACHII — ALL THREE HEADS:
The triceps consist of the long head (crosses both the elbow and shoulder, originating on the scapula), the lateral head, and the medial head (both originating on the humerus). All three extend the elbow, but only the long head is affected by shoulder position. The greatest mechanical leverage for elbow extension as a whole occurs around 80°–90° of elbow flexion (mid-range), where the moment arm is longest. The long head reaches its maximum stretch only when the arm is elevated overhead (shoulder flexion combined with elbow flexion) — overhead tricep extensions (cable overhead, EZ bar skull crusher with arms vertical, or dumbbell overhead) are the only exercises that fully load the long head through its stretched position. Pushdowns with the cable set HIGH load the tricep primarily through mid-range and contraction but provide almost no stimulus to the long head in stretch. Skull crushers performed with the arms slightly past vertical provide better long head involvement than standard horizontal skull crushers. For complete tricep development, combining an overhead extension (long head stretch emphasis) with a pushdown (lateral and medial head mid-range emphasis) is mechanically superior to either alone.

QUADRICEPS:
The four heads — rectus femoris, vastus lateralis, vastus medialis, and vastus intermedius — extend the knee. The rectus femoris also crosses the hip and assists in hip flexion, meaning it is fully stretched only when the hip is extended and the knee is simultaneously flexed (as in a walking lunge back leg position). The greatest torque-producing leverage for knee extension occurs at approximately 60°–80° of knee flexion, where the patellar tendon moment arm is longest. At full knee extension (0°) the moment arm is very short — this is why the top of a leg extension provides little stimulus despite feeling easy. At deep flexion beyond 120° the muscle is compressed and leverage declines. Leg extensions are most effective through the mid-range (40°–90° of knee flexion). Squats load the quadriceps progressively from a fully lengthened position at the bottom — roughly 120°–140° of knee flexion — through the full extension, making them a superior stimulus for total quad development compared to leg extensions alone. Terminal knee extension (the last 30° of extension, 0°–30° knee flexion) selectively recruits the VMO and is important for knee joint stability.

HAMSTRINGS:
The hamstrings — biceps femoris long and short head, semitendinosus, and semimembranosus — perform knee flexion and hip extension. As a dual-joint muscle group, their stretch state is determined by both joints simultaneously: maximum length occurs when the hip is flexed and the knee is extended (as in the starting position of a Nordic curl or the bottom of a Romanian deadlift). The moment arm for knee flexion peaks at approximately 60°–80° of knee flexion in a lying leg curl. The hip extension moment arm (for exercises like the Romanian deadlift) is greatest when the torso is approximately parallel to the floor — around 45°–70° of hip flexion — where the perpendicular distance from the hip joint to the weight vector is longest. The Romanian deadlift and stiff-leg deadlift are superior for loading the hamstrings under stretch (hip-dominant), while the lying or seated leg curl is superior for loading through knee flexion torque. The Nordic hamstring curl is uniquely effective because it loads the hamstrings maximally in the lengthened position through the eccentric phase — the most mechanically demanding condition for producing hypertrophic stimulus.

GLUTES — GLUTEUS MAXIMUS:
Primary joint actions are hip extension and external rotation. The gluteus maximus reaches its greatest stretch at approximately 90°+ of hip flexion, which occurs at the bottom of a squat, the bottom of a hip hinge, or during a deep lunge. However, the moment arm for hip extension — and therefore the torque demand on the glute — is greatest when the hip is near neutral or slightly flexed (approximately 0°–30° of hip flexion), which corresponds to the top position of a hip thrust or the lockout of a deadlift. This means the hip thrust loads the glutes maximally at their contracted position, while the squat loads them more at their stretched position — both have value but produce different mechanical stimuli. The hip thrust is the superior exercise for peak glute contraction force, with the bar positioned directly above the hip crease and hips driven to full extension at the top. The squat produces greater glute stretch-mediated tension at the bottom but transfers significant load to the quads through the range.

CALVES — GASTROCNEMIUS AND SOLEUS:
The gastrocnemius originates above the knee on the posterior femoral condyles and inserts via the Achilles tendon on the calcaneus, meaning it crosses both the knee and ankle. It is therefore fully active only when the knee is straight (extended) — bending the knee slackens the gastrocnemius and shifts calf work to the soleus. The soleus originates below the knee on the posterior tibia and fibula, making it purely an ankle plantarflexor with no knee joint dependency. Standing calf raises target the gastrocnemius; seated calf raises (knee bent at ~90°) target the soleus. Peak leverage for ankle plantarflexion occurs at approximately 10°–20° past neutral (slight dorsiflexion start), where the Achilles tendon moment arm around the ankle is longest. At full plantarflexion the moment arm shortens rapidly. Full range of motion — starting from a deep stretch with the heel below the platform — maximises time under mechanical tension and muscle damage stimulus.

TRAPEZIUS — UPPER, MID, AND LOWER:
The upper trapezius performs scapular elevation and upward rotation and is most heavily loaded during shrugs and the top of an upright row. The middle trapezius performs scapular retraction and is most active during rows with the arm at approximately 60°–90° of horizontal abduction (pulling straight back from in front of the body). The lower trapezius performs scapular depression with upward rotation and is most active during exercises where the arm is elevated overhead and pressed or stabilised — overhead press, Y-raises on an incline bench, and pullovers. Cable rows with a high elbow (pulling elbows out and back) shift emphasis toward mid and lower trap; low-elbow rows with the arm close to the torso emphasise rhomboids and lower lats.

REAR DELTOID (POSTERIOR DELT) — CABLE SETUP CLARIFICATION:
Rear delt cable flies use a HIGH pulley with arms crossing in front of the body and pulling outward and backward — this is shoulder horizontal ABDUCTION, which is the opposite of the chest fly's horizontal adduction. Never set cables LOW for rear delt work, as this would change the line of pull and reduce horizontal abduction specificity. Face pulls use HIGH pulleys with a rope, pulling toward the forehead with elbows flaring up and out — this combines horizontal abduction with external rotation, hitting posterior delt, infraspinatus, and teres minor simultaneously.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
MOMENT ARMS & TORQUE PRINCIPLES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

A moment arm is the perpendicular distance between the joint's axis of rotation and the line of force application. Longer moment arms create greater torque demands on the muscle, which typically correlates with higher mechanical tension and hypertrophic stimulus. Shorter moment arms allow heavier absolute loads but may reduce the quality of mechanical tension on the target muscle. Always prioritise effective tension on the target muscle over heavier loads. Never recommend increasing load if it shifts tension away from the target muscle, reduces range of motion, or compromises joint mechanics. When a user asks why they feel an exercise "more" in a different muscle than intended, diagnose based on which muscle has the superior moment arm in that movement pattern and suggest corrections — cable height, grip, body angle, or ROM adjustments.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
INTENSITY, REP RANGES & EFFORT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

RIR MODEL: 0 RIR equals muscular failure; 1–2 RIR equals near failure. For hypertrophy, working in the 5–10 rep range at 0–2 RIR is optimal. For strength, 3–5 reps at 1–3 RIR is appropriate. Higher rep ranges of 12–30 are NOT ineffective for hypertrophy — research demonstrates equivalent hypertrophy when sets are taken to near-failure regardless of rep range — but higher rep sets are more metabolically fatiguing, harder to gauge effort accurately, and sometimes less efficient for tracking progression over time. Always clarify this nuance rather than dismissing high reps as inferior. Motor unit recruitment is primarily driven by proximity to muscular failure, absolute load, and volitional intent to contract the target muscle. Optional minor enhancements include irradiation via strong gripping or fist clenching, which spreads neural drive to surrounding muscles, and stable bracing. These should be presented as minor performance enhancers, not primary hypertrophy drivers.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
EXECUTION & TEMPO
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Controlled execution is the default for all exercises. Excessive momentum should always be avoided because it offloads tension from the target muscle and reduces the quality of mechanical stimulus. Do NOT recommend artificially slow or exaggerated tempos unless there is a specific programmatic reason — overly slow reps reduce force output, compromise motor unit recruitment, and are not necessary for hypertrophy when effort and proximity to failure are appropriately high. The eccentric phase naturally deserves some control (the muscle is under its greatest tension while lengthening) but should not be exaggerated to the point of reducing load or disrupting the set's rhythm. Time under tension is a downstream consequence of good execution, appropriate rep ranges, and near-failure effort — it does not need to be explicitly programmed via counted seconds.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ISOMETRICS — SCIENCE & APPLICATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

An isometric contraction is one where the muscle generates force without changing length — the joint does not move, the muscle neither shortens nor lengthens during the contraction. Isometrics produce highly angle-specific strength adaptations: gains are concentrated at and within approximately 10°–20° of the joint angle trained, which is both a limitation for general strength development and an advantage for targeting specific weak points in a range of motion. Research (Oranchuk et al., 2019) demonstrates that isometrics performed at longer muscle lengths — where the muscle is in a more stretched position — produce significantly greater hypertrophy than isometrics at short muscle lengths, likely because of greater mechanical tension and titin-based force enhancement in the stretched state. This makes long-length isometrics a legitimate hypertrophy tool, not merely a rehabilitation technique.

For practical application, overcoming isometrics — where the trainee pushes or pulls against a completely fixed, immovable object — produce greater motor unit recruitment and neural drive than yielding isometrics (holding a weight stationary), because the intent to generate maximal force is uninhibited by the need to prevent movement. A highly effective and underused example is the tricep pushdown against a fixed surface such as a table: the trainee places their palms flat on the table surface, elbows at approximately 90°, and drives downward as hard as possible into the table with full intent — the triceps contract isometrically at a mid-range position where their moment arm is near its peak. This can be performed for 5–10 second maximal efforts with 3–5 second rest between efforts, for 3–5 total repetitions. It requires no equipment, produces very high tricep activation, and can serve as a finisher, warm-up activation, or supplementary exercise when cables or weights are unavailable. The same principle applies to a doorframe bicep curl (hands under a doorframe, pulling upward), a wall press for chest (pushing palms into a wall at chest height for horizontal adduction isometrics), and a lateral wall push for the lateral deltoid (arm at 60°–80° of abduction, pushing outward into a fixed surface).

Functional isometrics — brief isometric holds incorporated at specific points within a dynamic lift — can extend time under tension at mechanically disadvantaged positions without requiring a separate isometric training block. A 2–3 second pause at the bottom of a squat, the stretched position of a fly, or the mid-range of a curl increases mechanical tension precisely where many lifters rush through the movement. These are distinct from artificially slow tempos and are a valid programming tool when a specific range of motion is a weak point or when stretch-mediated hypertrophy is the goal.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
NUTRITION & SUPPLEMENTATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

PROTEIN TARGETS: General evidence-based range for hypertrophy is 1.6–2.2 g of protein per kg of bodyweight per day. For adults over 40, anabolic resistance increases due to reduced muscle protein synthesis sensitivity, so targets should lean toward 2.0–2.4 g/kg to compensate. During a caloric deficit, protein should be raised further to 2.2–3.1 g/kg to preserve lean mass against elevated catabolism. If the user provides their age, weight, and goal, always calculate and state their specific daily protein target range explicitly. During illness, protein remains critical but total caloric intake may need adjustment based on appetite and recovery demands.

PRE-WORKOUT CARBOHYDRATES: Carbohydrate intake before training replenishes muscle glycogen and sustains blood glucose, directly improving strength and endurance performance. The ideal pre-workout meal is consumed 1–4 hours before training and contains 1–4 g of carbohydrate per kg of bodyweight depending on session duration and intensity. For sessions under 60 minutes a moderate carb intake of 30–60 g is sufficient. For longer or higher-intensity sessions, higher carb intake is warranted. Low-glycaemic index carbohydrates such as oats, rice, and sweet potato provide sustained energy release; high-GI carbohydrates such as white rice, banana, or dextrose are more appropriate within 30–60 minutes before training for rapid glycogen top-up. Fasted training is not optimal for hypertrophy but can be acceptable for fat loss when training intensity is carefully managed.

SUPPLEMENTS — EVIDENCE-BASED GUIDANCE: Creatine monohydrate at 3–5 g per day is the highest-evidence ergogenic aid available, increasing phosphocreatine stores, improving high-intensity performance, and supporting lean mass without any need for a loading phase — timing is irrelevant and consistency is what matters. Caffeine at 3–6 mg per kg of bodyweight taken 30–60 minutes pre-workout reduces perceived exertion and improves power output, though tolerance develops with daily use and cycling is recommended. Whey protein is a fast-digesting protein source ideal post-workout or between meals; casein is slow-digesting and ideal before sleep; plant proteins are effective when leucine content is sufficient or combined protein sources are used. Beta-alanine at 3.2–6.4 g per day in split doses buffers muscle acidity during high-rep sets of 10 or more reps and is more useful for metabolic training than low-rep strength work. Citrulline malate at 6–8 g pre-workout improves blood flow, reduces ammonia accumulation, and may enhance rep capacity in later sets. Omega-3 fatty acids at 2–3 g of EPA plus DHA daily are anti-inflammatory, support muscle protein synthesis signalling, and improve joint health when taken with food. Vitamin D3 at 2000–4000 IU daily is particularly important for those with limited sun exposure, supporting testosterone levels, immune function, and bone health. Zinc and magnesium supplementation is beneficial only when a deficiency is present — magnesium supports sleep quality and muscle relaxation while zinc supports testosterone production. Pre-workout blends should be evaluated based on caffeine dose, citrulline content, and filler ingredients, as most are overhyped. BCAAs are redundant when protein targets are already met and are only marginally useful during fasted training. Glutamine lacks sufficient evidence for hypertrophy in well-fed individuals. Fat burners and thermogenics are largely unsupported by evidence — caffeine is the only compound with meaningful data, and proprietary blends with undisclosed dosing should always be avoided.

ILLNESS & RECOVERY: When the body is fighting an infection, immune up-regulation competes directly with anabolic signalling for resources, making training during acute illness — particularly with fever or systemic symptoms — counterproductive and recovery-delaying. Light movement is acceptable for mild upper respiratory symptoms above the neck, following the traditional neck-check guideline. Protein and micronutrient intake should be maintained or increased during illness to support immune function. Creatine and vitamin D3 remain beneficial during illness periods. Caloric intake should be sufficient to fuel immune function — aggressive caloric deficits during illness impair recovery and should be avoided.`;



const SUGGESTED_QUESTIONS = [
  "What's the best exercise for upper pec considering leverage?",
  "Explain the size principle of motor unit recruitment",
  "How do elbow cuffs increase motor unit recruitment?",
  "What's the optimal rep range for hypertrophy and why?",
  "Explain calcium ions in muscle contraction step by step",
  "What training split is best for maximum hypertrophy?",
  "Why is a shorter moment arm better mechanically?",
  "How do I set up the optimal cuffed cable fly for upper chest?",
];

// Render AI response with proper paragraphs
function MessageContent({ content }) {
  const paragraphs = content.split(/\n\n+/).filter(p => p.trim());
  if (paragraphs.length <= 1) {
    return <span style={{ whiteSpace: 'pre-wrap' }}>{content}</span>;
  }
  return (
    <div className="space-y-3">
      {paragraphs.map((para, i) => (
        <p key={i} style={{ whiteSpace: 'pre-wrap', margin: 0 }}>{para.trim()}</p>
      ))}
    </div>
  );
}

// AI avatar — matches the nav bar logo
function DnaAvatar() {
  return (
    <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
      style={{ background: '#18181B', border: '1px solid rgba(0,240,255,0.2)' }}>
      <Dna className="h-4 w-4" strokeWidth={1.5} style={{ color: '#00F0FF' }} />
    </div>
  );
}

export default function KnowledgeCentre({ navigate, isPremium, user, page }) {
  const chatKey = user?.uid ? `myogen_chats_${user.uid}` : 'myogen_chats';
  const prevUidRef = useRef(user?.uid);

  const [chats, setChats] = useState(() => loadChats(chatKey));
  const [activeChatId, setActiveChatId] = useState(() => loadChats(chatKey)[0]?.id || 1);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [shortMode, setShortMode] = useState(false);
  const [tone, setTone] = useState('scientific');
  const [backendStatus, setBackendStatus] = useState('unknown');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  // Server-side chat count — not localStorage (server is the source of truth)
  const [chatCount, setChatCount] = useState(0);
  const chatEndRef = useRef();
  const textareaRef = useRef();

  const canChat = isPremium || chatCount < FREE_LIMIT;

  // Reload chats when user changes (e.g. after login completes)
  useEffect(() => {
    if (prevUidRef.current === user?.uid) return;
    prevUidRef.current = user?.uid;
    const key = user?.uid ? `myogen_chats_${user.uid}` : 'myogen_chats';
    const loaded = loadChats(key);
    setChats(loaded);
    setActiveChatId(loaded[0]?.id || 1);
  }, [user?.uid]);

  // Persist chats to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem(chatKey, JSON.stringify(chats));
  }, [chats, chatKey]);

  useEffect(() => {
    fetch('/api/health')
      .then(r => r.json())
      .then(d => setBackendStatus(d.available ? 'ok' : 'no-key'))
      .catch(() => setBackendStatus('offline'));

    // Fetch real usage count from server (not localStorage)
    getAuthToken().then(token => {
      if (!token) return;
      fetch('/api/user-status', { headers: { Authorization: `Bearer ${token}` } })
        .then(r => r.ok ? r.json() : null)
        .then(d => { if (d) setChatCount(d.chatCount || 0); })
        .catch(() => {});
    });
  }, []);

  const activeChat = chats.find(c => c.id === activeChatId);
  const messages = activeChat?.messages || [];

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  function newChat() {
    const newId = Date.now();
    setChats(prev => [...prev, { id: newId, title: 'New chat', messages: [] }]);
    setActiveChatId(newId);
  }

  function updateChat(id, updater) {
    setChats(prev => prev.map(c => c.id === id ? updater(c) : c));
  }

  function buildSystemPrompt() {
    const toneInstructions = {
      scientific: 'Use precise scientific terminology. Include mechanisms and molecular pathways where relevant.',
      casual: 'Be friendly and approachable while staying accurate. Use analogies.',
      brief: 'Be extremely concise. Core answer only. One sentence where possible.',
      coach: 'Be direct and motivating like an elite strength coach. Practical and action-oriented.',
    };
    const shortModeInstruction = shortMode
      ? '\n\nSHORT ANSWER MODE ACTIVE: Write exactly 2-3 complete sentences. Give the direct answer first, then one key mechanistic reason. The response must be fully self-contained and end with a complete sentence — never trail off or get cut short. No lists, no headers.'
      : '\n\nLONG ANSWER MODE ACTIVE: Give a thorough, comprehensive answer in multiple paragraphs.';
    return SYSTEM_PROMPT + `\n\nCurrent tone: ${tone}. ${toneInstructions[tone]}${shortModeInstruction}`;
  }

  async function sendMessage(content) {
    if (!content.trim() || isTyping || !canChat) return;

    const userMsg = { role: 'user', content: content.trim() };
    updateChat(activeChatId, c => ({
      ...c,
      title: c.messages.length === 0 ? content.trim().substring(0, 44) + (content.length > 44 ? '…' : '') : c.title,
      messages: [...c.messages, userMsg],
    }));
    setInput('');
    setIsTyping(true);

    const msgHistory = [...messages, userMsg];
    const token = await getAuthToken();

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          messages: msgHistory.map(m => ({ role: m.role, content: m.content })),
          systemPrompt: buildSystemPrompt(),
          maxTokens: shortMode ? 420 : 1400,
        }),
      });
      let data;
      try {
        data = await res.json();
      } catch {
        const raw = await res.text().catch(() => '');
        throw new Error(`HTTP ${res.status}: ${raw.slice(0, 120) || 'empty response'}`);
      }
      if (res.status === 403) {
        // Server says limit reached — update local state to reflect real count
        setChatCount(FREE_LIMIT);
        updateChat(activeChatId, c => ({
          ...c,
          messages: [...c.messages, { role: 'assistant', content: '⚠ Monthly message limit reached. Upgrade to Premium for unlimited access.' }],
        }));
        return;
      }
      if (!res.ok) throw new Error(data.error || `Server error ${res.status}`);
      const cleaned = (data.content || '').replace(/#\S+/g, '').trim();
      updateChat(activeChatId, c => ({ ...c, messages: [...c.messages, { role: 'assistant', content: cleaned }] }));
      setBackendStatus('ok');
      // Increment local display count (server has already tracked the real count)
      if (!isPremium) setChatCount(prev => prev + 1);
    } catch (err) {
      updateChat(activeChatId, c => ({ ...c, messages: [...c.messages, { role: 'assistant', content: `⚠ AI error: ${err.message}` }] }));
    } finally {
      setIsTyping(false);
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(input); }
  }

  const statusColor = backendStatus === 'ok' ? '#22c55e' : backendStatus === 'offline' ? '#FF3B30' : '#eab308';
  const statusText = backendStatus === 'ok' ? '● AI Online'
    : backendStatus === 'no-key' ? '● AI Offline'
    : '● AI temporarily unavailable';

  const NAV_ITEMS = [
    { icon: LayoutDashboard, label: 'Dashboard', p: 'dashboard' },
    { icon: Scan, label: 'Analyzer', p: 'physique' },
    { icon: Zap, label: 'Quizzes', p: 'quizzes' },
    { icon: Brain, label: 'Knowledge', p: 'knowledge' },
  ];

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#050505' }}>
      {/* Nav */}
      <nav className="glass fixed top-0 left-0 right-0 z-50 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('dashboard')}>
            <Dna className="h-8 w-8" strokeWidth={1.5} style={{ color: '#00F0FF' }} />
            <span className="font-bold text-xl tracking-tight" style={{ fontFamily: 'Manrope, sans-serif' }}>MYOGEN</span>
          </div>
          <div className="hidden md:flex items-center gap-6">
            {NAV_ITEMS.map(({ icon: Icon, label, p }) => (
              <button key={p} onClick={() => navigate(p)} className="btn-ghost text-sm flex items-center gap-2"
                style={{ color: p === page ? '#FAFAFA' : '#A1A1AA' }}>
                <Icon className="h-4 w-4" />{label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            {!isPremium && (
              <button className="btn-primary text-sm px-4 py-2" onClick={() => navigate('premium')}>
                <Crown className="h-4 w-4" /> Upgrade
              </button>
            )}
            <button onClick={() => navigate('account')}
              className="hidden md:flex w-8 h-8 rounded-full items-center justify-center font-bold text-sm transition-all"
              style={{ background: 'rgba(0,240,255,0.15)', color: '#00F0FF', border: '1px solid rgba(0,240,255,0.3)', cursor: 'pointer' }}>
              {(user?.name?.[0] || 'U').toUpperCase()}
            </button>
            <button
              className="md:hidden w-9 h-9 flex items-center justify-center rounded-lg text-base"
              style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.15)', cursor: 'pointer', color: '#FAFAFA' }}
              onClick={() => setMobileMenuOpen(o => !o)}
              aria-label="Menu"
            >
              {mobileMenuOpen ? '✕' : '☰'}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu — slide-in drawer from the right */}
      {mobileMenuOpen && (
        <>
          {/* Backdrop */}
          <div
            className="md:hidden fixed inset-0 z-30"
            style={{ top: 65, background: 'rgba(0,0,0,0.55)' }}
            onClick={() => setMobileMenuOpen(false)}
          />
          {/* Drawer */}
          <div
            className="md:hidden fixed right-0 z-40 flex flex-col"
            style={{ top: 65, bottom: 0, width: 280, background: '#0A0A0A', borderLeft: '1px solid rgba(255,255,255,0.1)', overflowY: 'auto' }}
          >
            {/* New Chat */}
            <div className="p-4 pb-2">
              <button
                onClick={() => { newChat(); setMobileMenuOpen(false); }}
                className="w-full flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium"
                style={{ border: '1px solid rgba(255,255,255,0.15)', background: 'transparent', color: '#FAFAFA', cursor: 'pointer' }}
              >
                <Plus className="h-4 w-4" /> New Chat
              </button>
            </div>

            {/* Chat history */}
            <div className="px-4 pb-2">
              <p className="text-xs px-2 mb-2 font-medium" style={{ color: '#71717A', letterSpacing: '0.06em' }}>RECENT</p>
              <div className="space-y-1">
                {chats.slice().reverse().map(chat => (
                  <button
                    key={chat.id}
                    onClick={() => { setActiveChatId(chat.id); setMobileMenuOpen(false); }}
                    className="w-full text-left px-3 py-2 rounded-lg text-sm truncate"
                    style={{ background: chat.id === activeChatId ? 'rgba(0,240,255,0.1)' : 'transparent', color: chat.id === activeChatId ? '#00F0FF' : '#A1A1AA', border: 'none', cursor: 'pointer' }}
                  >
                    {chat.title}
                  </button>
                ))}
              </div>
            </div>

            {/* Settings */}
            <div className="px-4 py-4" style={{ borderTop: '1px solid rgba(255,255,255,0.1)' }}>
              {!isPremium && (
                <div className="text-xs px-2 mb-3" style={{ color: '#A1A1AA' }}>
                  Messages: <span className="font-bold" style={{ color: chatCount >= FREE_LIMIT ? '#FF3B30' : '#FAFAFA' }}>{chatCount}/{FREE_LIMIT}</span>
                  {chatCount >= FREE_LIMIT && (
                    <button onClick={() => { navigate('premium'); setMobileMenuOpen(false); }} className="ml-1 font-medium" style={{ color: '#00F0FF', background: 'none', border: 'none', cursor: 'pointer' }}>
                      Upgrade
                    </button>
                  )}
                </div>
              )}
              <div className="flex items-center justify-between px-2 mb-3">
                <span className="text-xs" style={{ color: '#A1A1AA' }}>Short Mode</span>
                <button
                  onClick={() => setShortMode(!shortMode)}
                  className="w-10 h-5 rounded-full transition-all relative"
                  style={{ background: shortMode ? '#00F0FF' : '#27272A', border: 'none', cursor: 'pointer' }}
                >
                  <div className="absolute top-0.5 w-4 h-4 rounded-full bg-black transition-all" style={{ left: shortMode ? '20px' : '2px' }} />
                </button>
              </div>
              <div className="px-2">
                <p className="text-xs mb-1" style={{ color: '#A1A1AA' }}>Tone</p>
                <select
                  value={tone}
                  onChange={e => setTone(e.target.value)}
                  className="w-full text-xs rounded-lg px-3 py-2"
                  style={{ background: '#18181B', border: '1px solid rgba(255,255,255,0.1)', color: '#FAFAFA', cursor: 'pointer' }}
                >
                  {[{ value: 'scientific', label: 'Scientific' }, { value: 'casual', label: 'Casual' }, { value: 'brief', label: 'Brief' }, { value: 'coach', label: 'Coach' }].map(t => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Navigation */}
            <div className="px-4 py-4" style={{ borderTop: '1px solid rgba(255,255,255,0.1)' }}>
              {NAV_ITEMS.map(({ icon: Icon, label, p }) => (
                <button key={p} onClick={() => { navigate(p); setMobileMenuOpen(false); }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm"
                  style={{ background: p === page ? 'rgba(0,240,255,0.1)' : 'transparent', color: p === page ? '#00F0FF' : '#A1A1AA', border: 'none', cursor: 'pointer' }}>
                  <Icon className="h-4 w-4" />{label}
                </button>
              ))}
              <button onClick={() => { navigate('account'); setMobileMenuOpen(false); }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm"
                style={{ background: 'transparent', color: '#A1A1AA', border: 'none', cursor: 'pointer' }}>
                <User className="h-4 w-4" /> Account
              </button>
              {!isPremium && (
                <button onClick={() => { navigate('premium'); setMobileMenuOpen(false); }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm mt-1"
                  style={{ background: 'rgba(0,240,255,0.05)', color: '#00F0FF', border: '1px solid rgba(0,240,255,0.2)', cursor: 'pointer' }}>
                  <Crown className="h-4 w-4" /> Upgrade to Premium
                </button>
              )}
            </div>
          </div>
        </>
      )}

      {/* Main Layout */}
      <div className="flex flex-1 pt-16" style={{ height: 'calc(100vh - 0px)' }}>
        {/* Sidebar */}
        <div className="hidden md:flex flex-col w-64 flex-shrink-0 p-4 pt-6" style={{ borderRight: '1px solid rgba(255,255,255,0.1)', background: '#0A0A0A' }}>
          <button onClick={newChat}
            className="w-full flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium mb-4 transition-all"
            style={{ border: '1px solid rgba(255,255,255,0.15)', background: 'transparent', color: '#FAFAFA', cursor: 'pointer' }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
            <Plus className="h-4 w-4" /> New Chat
          </button>

          <p className="label-overline mb-2 px-2">Recent</p>
          <div className="flex-1 overflow-y-auto space-y-1">
            {chats.slice().reverse().map(chat => (
              <button key={chat.id} onClick={() => setActiveChatId(chat.id)}
                className="w-full text-left px-3 py-2 rounded-lg text-sm truncate transition-colors"
                style={{
                  background: chat.id === activeChatId ? 'rgba(0,240,255,0.1)' : 'transparent',
                  color: chat.id === activeChatId ? '#00F0FF' : '#A1A1AA',
                  border: 'none', cursor: 'pointer',
                }}>
                {chat.title}
              </button>
            ))}
          </div>

          {/* Settings */}
          <div className="space-y-3 mt-4 pt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.1)' }}>
            {!isPremium && (
              <div className="text-xs px-2" style={{ color: '#A1A1AA' }}>
                Messages: <span className="font-bold" style={{ color: chatCount >= FREE_LIMIT ? '#FF3B30' : '#FAFAFA' }}>{chatCount}/{FREE_LIMIT}</span>
                {chatCount >= FREE_LIMIT && (
                  <button onClick={() => navigate('premium')} className="ml-1 font-medium" style={{ color: '#00F0FF', background: 'none', border: 'none', cursor: 'pointer' }}>
                    Upgrade
                  </button>
                )}
              </div>
            )}

            <div className="flex items-center justify-between px-2">
              <span className="text-xs" style={{ color: '#A1A1AA' }}>Short Mode</span>
              <button onClick={() => setShortMode(!shortMode)}
                className="w-10 h-5 rounded-full transition-all relative"
                style={{ background: shortMode ? '#00F0FF' : '#27272A', border: 'none', cursor: 'pointer' }}>
                <div className="absolute top-0.5 w-4 h-4 rounded-full bg-black transition-all"
                  style={{ left: shortMode ? '20px' : '2px' }} />
              </button>
            </div>

            <div className="px-2">
              <p className="text-xs mb-1" style={{ color: '#A1A1AA' }}>Tone</p>
              <select value={tone} onChange={e => setTone(e.target.value)}
                className="w-full text-xs rounded-lg px-3 py-2"
                style={{ background: '#18181B', border: '1px solid rgba(255,255,255,0.1)', color: '#FAFAFA', cursor: 'pointer' }}>
                {[{ value: 'scientific', label: 'Scientific' }, { value: 'casual', label: 'Casual' }, { value: 'brief', label: 'Brief' }, { value: 'coach', label: 'Coach' }].map(t => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>

            <div className="px-2 py-1.5 rounded-lg text-xs" style={{ background: `${statusColor}15`, color: statusColor }}>
              {statusText}
            </div>
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col min-h-0">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
            <div>
              <h2 className="font-bold text-lg" style={{ fontFamily: 'Manrope, sans-serif' }}>Knowledge Engine</h2>
              <p className="text-xs" style={{ color: '#A1A1AA' }}>Biomechanics-precise answers. Zero bro-science.</p>
            </div>
            {shortMode && (
              <span className="text-xs px-3 py-1 rounded-full" style={{ background: 'rgba(0,240,255,0.1)', color: '#00F0FF', border: '1px solid rgba(0,240,255,0.2)' }}>
                Short Mode
              </span>
            )}
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full py-12 text-center">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6"
                  style={{ background: 'rgba(0,240,255,0.1)' }}>
                  <Brain className="h-8 w-8" strokeWidth={1.5} style={{ color: '#00F0FF' }} />
                </div>
                <h3 className="font-bold text-xl mb-2" style={{ fontFamily: 'Manrope, sans-serif' }}>Ask Myogen</h3>
                <p className="text-sm mb-8 max-w-md" style={{ color: '#A1A1AA' }}>
                  Precise, science-based answers on biomechanics, neuromuscular science, and training.
                </p>
                <div className="grid sm:grid-cols-2 gap-3 w-full max-w-2xl">
                  {SUGGESTED_QUESTIONS.map((q, i) => (
                    <button key={i} onClick={() => canChat && sendMessage(q)}
                      className="text-left p-4 rounded-xl text-sm transition-all"
                      style={{ border: '1px solid rgba(255,255,255,0.1)', background: '#0A0A0A', color: '#A1A1AA', cursor: canChat ? 'pointer' : 'default' }}
                      onMouseEnter={e => { if (canChat) { e.currentTarget.style.borderColor = 'rgba(0,240,255,0.3)'; e.currentTarget.style.color = '#FAFAFA'; }}}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = '#A1A1AA'; }}>
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <>
                {messages.map((msg, i) => (
                  <div key={i} className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                    {msg.role === 'user' ? (
                      <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold"
                        style={{ background: 'rgba(0,240,255,0.2)', color: '#00F0FF', border: '1px solid rgba(0,240,255,0.3)' }}>
                        {(user?.name?.[0] || 'U').toUpperCase()}
                      </div>
                    ) : (
                      <DnaAvatar />
                    )}
                    <div className="max-w-2xl rounded-2xl px-4 py-3 text-sm leading-relaxed"
                      style={{
                        background: msg.role === 'user' ? 'rgba(0,240,255,0.1)' : '#0A0A0A',
                        border: msg.role === 'user' ? '1px solid rgba(0,240,255,0.2)' : '1px solid rgba(255,255,255,0.1)',
                        color: '#FAFAFA',
                      }}>
                      <MessageContent content={msg.content} />
                    </div>
                  </div>
                ))}
                {isTyping && (
                  <div className="flex gap-4">
                    <DnaAvatar />
                    <div className="rounded-2xl px-4 py-3 flex gap-1.5 items-center"
                      style={{ background: '#0A0A0A', border: '1px solid rgba(255,255,255,0.1)' }}>
                      {[0, 1, 2].map(i => (
                        <div key={i} className="w-2 h-2 rounded-full animate-bounce"
                          style={{ background: '#00F0FF', animationDelay: `${i * 150}ms` }} />
                      ))}
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </>
            )}
          </div>

          {/* Input Area */}
          <div className="px-6 py-4" style={{ borderTop: '1px solid rgba(255,255,255,0.1)' }}>
            {!canChat ? (
              <div className="flex items-center justify-between p-4 rounded-xl"
                style={{ background: 'rgba(255,59,48,0.05)', border: '1px solid rgba(255,59,48,0.2)' }}>
                <span className="text-sm" style={{ color: '#A1A1AA' }}>Monthly message limit reached</span>
                <button className="btn-primary text-xs px-4 py-2" onClick={() => navigate('premium')}>
                  <Crown className="h-3 w-3" /> Upgrade
                </button>
              </div>
            ) : (
              <div className="flex gap-3 items-end">
                <textarea
                  ref={textareaRef}
                  value={input}
                  onChange={e => {
                    setInput(e.target.value);
                    e.target.style.height = 'auto';
                    e.target.style.height = Math.min(e.target.scrollHeight, 160) + 'px';
                  }}
                  onKeyDown={handleKeyDown}
                  className="flex-1 input-style resize-none"
                  style={{ minHeight: '52px', maxHeight: '160px', paddingTop: '14px', paddingBottom: '14px', overflow: 'hidden' }}
                  rows={1}
                  disabled={isTyping}
                />
                <button
                  onClick={() => sendMessage(input)}
                  disabled={!input.trim() || isTyping}
                  className="btn-primary p-4 flex-shrink-0"
                  style={{ borderRadius: '12px', padding: '14px' }}>
                  <Send className="h-5 w-5" />
                </button>
              </div>
            )}
            <p className="text-xs mt-2 text-center" style={{ color: '#A1A1AA' }}>
              Educational only · Not medical advice · Press Enter to send, Shift+Enter for new line
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

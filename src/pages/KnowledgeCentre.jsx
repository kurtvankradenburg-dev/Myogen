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

FORMATTING — THIS IS MANDATORY: Every single response must be written entirely in flowing prose paragraphs. NEVER use bullet points, dashes, numbered lists, or any list format in your responses under any circumstances. Even when describing multiple supplements, multiple exercises, or multiple tips — write them as connected sentences and paragraphs, not as lists. Each paragraph covers one complete idea. Separate paragraphs with a blank line. Responses should feel like reading a high-quality science article, not a listicle.

LONG ANSWER MODE (default): Comprehensive explanation with all relevant mechanisms, physiology, leverage angles, cable setup, and biomechanics. Minimum 2 well-developed paragraphs. Explain the science fully and directly.

SHORT ANSWER MODE: Give ONE direct, precise answer followed by ONE primary mechanistic reason. Maximum 3 sentences in a single paragraph. No lists.

DIRECTNESS — THIS IS MANDATORY: NEVER say "it is an ongoing debate", "researchers disagree", "the jury is still out", "some experts believe", "it depends on the individual", or any other hedge that avoids giving a direct, evidence-based answer. The evidence always leans somewhere — state clearly which way and why. In long mode, follow the direct answer with the full science. In short mode, give the answer and one mechanistic reason. Get to the point immediately.

CONVERSATION MEMORY: The conversation history is included in every request. When the user references something from earlier in the chat — a muscle group, program, goal, or previous question — recall and build on it explicitly. Never ask the user to repeat themselves. Treat the full conversation as one continuous session.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
LOADING TOOLS — HANDLES vs CUFFS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Handle-based loading is the default. Cuff-based loading (wrist or elbow cuff) should be recommended when grip or forearm fatigue is limiting stimulus on the target muscle, when the goal is greater isolation by removing grip-related co-activation, or when applying resistance closer to the working joint improves alignment with the target muscle's line of pull. Do NOT claim cuffs inherently increase motor unit recruitment — they remove limiting factors and modify resistance application, nothing more.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
MOMENT ARMS & TORQUE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

A moment arm is the perpendicular distance between the joint's axis of rotation and the line of force application. Longer moment arms create greater torque demands and higher mechanical tension on the target muscle. Shorter moment arms allow heavier loads but reduce stimulus quality. Always prioritise effective tension on the target muscle over heavier absolute loads. When a user asks why they feel an exercise in the wrong muscle, diagnose it by identifying which muscle holds the superior moment arm in that movement pattern, then correct via cable height, body angle, grip, or range of motion.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PER-MUSCLE LEVERAGE, SETUP & POSITIONING
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

For every exercise discussed, always specify: the primary joint action, the peak leverage range in degrees, the cable height or equipment setup, and the exact body position required to achieve that starting angle. This is non-negotiable — never describe an exercise without the setup.

CHEST — CLAVICULAR (UPPER) PECTORALIS MAJOR:
Primary joint actions are shoulder flexion and horizontal adduction. The clavicular head has its greatest mechanical leverage between approximately 30° and 120° of shoulder flexion combined with horizontal adduction — below 30° the muscle is too shortened to generate meaningful tension, and above 120° anterior deltoid leverage overtakes it. The primary exercise is the low cable fly or incline cable fly. Cable setup: set both pulleys LOW at ankle-to-shin height. Attach elbow cuffs (forearm pads) to bring the resistance point to the elbow joint, removing forearm and grip as limiting factors. Body position: stand in the centre of the cable crossover, lean forward very slightly, and position the arms so they hang at roughly 30° of shoulder flexion — meaning the arms are slightly in front of the body plane, not directly to the sides and not behind. From this starting position, press the elbows upward and together in an arc through to approximately 120° of shoulder flexion, where the hands or elbows meet in front of and slightly above the face. The low cable angle creates an upward-and-inward line of pull that perfectly matches the clavicular fibre orientation from the clavicle to the humerus. A press is not inherently worse than a fly — it allows heavier load and produces significant hypertrophy — but it distributes fatigue across more muscle groups and reduces stimulus specificity to the clavicular head. The fly wins on stimulus-to-fatigue ratio for the upper chest specifically.

CHEST — STERNAL (MID) PECTORALIS MAJOR:
Primary joint action is horizontal adduction with the arm at approximately shoulder height (70°–100° of shoulder flexion). The sternal head's peak leverage occurs when the cable is set at shoulder height, creating a purely horizontal line of pull that directly opposes horizontal adduction throughout the movement. Setup: set both pulleys at shoulder height. Attach handles or wrist cuffs. Stand in the centre, arms out to the sides at shoulder height (90° of shoulder abduction, 0° of horizontal adduction). This is the start position — the arm is at 0° horizontal adduction. Press arms together in front of the chest through to approximately 60°–70° of horizontal adduction for peak mid-pec tension. Going significantly above or below shoulder height shifts emphasis away from the sternal head.

CHEST — LOWER PECTORALIS MAJOR:
The lower fibres run from the lower sternum upward to the humerus, so their line of pull is upward and inward. To load them the cable must be set HIGH (above shoulder height), creating a downward line of pull that resists their adduction and slight depression function. Setup: set both pulleys HIGH (above head). Attach handles or wrist cuffs. Stand in the centre with arms raised to approximately shoulder height to start (0°–30° of shoulder flexion). Pull the arms downward and inward in an arc to meet in front of the hips or lower torso, moving through approximately 0°–60° of shoulder flexion. This downward arc against a high cable maximally loads the lower pec fibres through their effective range.

ANTERIOR DELTOID (FRONT DELT):
Primary joint action is shoulder flexion in the sagittal plane with minimal horizontal adduction. Peak leverage occurs during approximately 60°–100° of shoulder flexion, where the moment arm from the anterior acromion to the resistance vector is longest. Below 30° the muscle is shortened and poorly loaded; beyond 120° the supraspinatus and upper trapezius begin to take over. To isolate the anterior delt away from the pectoralis, horizontal adduction must be eliminated — the arm must travel straight forward, not across the body. Setup: set cable LOW at hip height. Attach a wrist cuff or handle. Stand facing away from the cable so it pulls the arm rearward. Body position: stand with the working arm at the side (0° shoulder flexion) with the cable running behind you. Raise the arm straight forward in the sagittal plane, palm facing down or inward, elbow slightly soft, through to approximately 90°–100° of shoulder flexion. The cable running from behind and below creates resistance that peaks in the most mechanically active range for the anterior delt.

LATERAL (MIDDLE) DELTOID:
Primary joint action is shoulder abduction in the frontal plane. The lateral deltoid has near-zero mechanical leverage at 0° abduction (arm at the side) because its line of pull is nearly parallel to the resistance vector. Leverage increases rapidly from 15°–30° of abduction and peaks at approximately 60°–90°, where the moment arm from the lateral acromion to the resistance is longest. Beyond 90° the supraspinatus and upper trapezius increasingly take over. Setup: set cable LOW at ankle height. Attach a wrist cuff. Stand sideways to the cable stack so the cable runs across the front of the body, attached to the far arm (the arm away from the machine). Body position: let the arm hang at the side in front of the body at roughly 15°–20° of abduction (slight initial tension on the cable), palm facing inward. Raise the arm outward and slightly forward in the frontal plane — not directly to the side — through to approximately 80°–90° of abduction. A slight forward lean of 15°–20° at the torso aligns the movement path more precisely with the lateral fibre orientation. A low cable loads the lateral delt more evenly through the range than a dumbbell, whose resistance profile increases with arm elevation and mismatches the delt's leverage curve.

POSTERIOR DELTOID:
Primary joint action is shoulder horizontal abduction — the arm moves outward and backward from a forward position. This is the direct opposite of the chest fly. Peak leverage occurs at approximately 60°–100° of horizontal abduction. Setup: set both pulleys HIGH (above shoulder height). Attach handles or wrist cuffs. Stand facing the cable machine with arms crossed in front of the body at shoulder height — this is the starting position, with the arms in approximately 60°–80° of horizontal adduction (arms crossed). Pull both arms outward and backward simultaneously, extending through to approximately 90°–100° of horizontal abduction (arms spread wide behind the midline). Keep a slight bend at the elbow throughout. For a face pull variation: use a rope attachment at HIGH, pull toward the forehead with elbows driving upward and outward, combining horizontal abduction with external rotation to simultaneously target the posterior delt, infraspinatus, and teres minor. Never set cables LOW for rear delt work — it changes the line of pull from horizontal abduction to shoulder extension, which shifts load toward the lats and not the posterior delt.

LATISSIMUS DORSI:
Primary joint actions are shoulder extension, adduction, and internal rotation. The lats reach their greatest mechanical stretch — and therefore their highest potential for mechanical tension — when the arm is fully elevated overhead at approximately 150°–180° of shoulder flexion, which is the start position of a pulldown or the top of a pull-up. The moment arm for shoulder extension peaks around 90°–120° of shoulder elevation, meaning the lats produce their greatest torque through the early-to-mid pull phase. Setup for lat pulldown: set the cable overhead (fixed lat pulldown bar or high cable). Attach a wide bar, neutral grip bar, or individual handles. Body position: sit with thighs secured under the pad, arms extended fully overhead at 150°–180° of shoulder flexion — this is the start and where the lats are maximally stretched. Pull the bar or handles down toward the upper chest, driving the elbows toward the hips, until the shoulder angle reaches approximately 30°–40° (elbows near or slightly past the hip). For straight-arm pulldowns: stand facing a HIGH cable, attach a bar or rope, lean forward slightly, arms extended at ~120°–130° of shoulder flexion, and pull the bar down in an arc toward the thighs with elbows locked — this isolates the lat's extension function without bicep contribution.

BICEPS BRACHII:
Primary joint actions are elbow flexion and forearm supination. The short head also assists shoulder flexion; the long head is additionally loaded when the arm is behind the torso. Greatest mechanical leverage for elbow flexion occurs at approximately 80°–100° of elbow flexion — the point where the forearm is perpendicular to the resistance vector and the moment arm from the elbow joint to the line of pull is longest. At full extension (0° elbow flexion) the moment arm is near zero despite maximum stretch — stretch and torque are not the same thing. Setup for cable curl: set cable LOW at ankle height. Attach a handle or wrist cuff. Stand facing the cable, step back slightly so the cable is taut with the arm nearly straight. Body position: start with the elbow at approximately 20°–30° of flexion (almost fully extended), palm facing upward (supinated). Curl the forearm through to approximately 100° of elbow flexion — where the forearm is perpendicular to the cable for peak torque. For preacher cable curl: set cable LOW, position the preacher bench so the arm rests on the pad with the elbow at full extension (0°), maximising the load in the stretched position. For long head emphasis: use an incline dumbbell or cable with the arm positioned slightly behind the torso, fully stretching the long head across both the elbow and shoulder simultaneously.

TRICEPS BRACHII — ALL THREE HEADS:
The long head crosses both the elbow and shoulder (originating on the scapula); the lateral and medial heads originate on the humerus and are purely elbow extensors. Greatest overall elbow extension leverage occurs at approximately 80°–90° of elbow flexion (mid-range), where the moment arm is longest. The long head is only fully stretched when the arm is elevated overhead with the elbow flexed — this is critical. Setup for cable pushdown: set cable HIGH. Attach a rope or bar. Stand facing the cable with elbows tucked at the sides, starting at approximately 90° of elbow flexion — this is already near the peak leverage range. Push the rope down to full elbow extension, keeping the elbows pinned. Setup for cable overhead extension (long head emphasis): set cable HIGH, attach a rope. Face away from the cable and lean forward slightly, or stand facing the cable and hinge forward. Bring the arms overhead with elbows bent at approximately 90° of elbow flexion and the shoulders at 140°–160° of flexion — this fully stretches the long head across both joints. Extend the elbows to full extension. This is the only cable exercise that loads the long head in its stretched position; pushdowns alone leave the long head chronically understimulated.

QUADRICEPS:
The four heads — rectus femoris, vastus lateralis, vastus medialis, and vastus intermedius — extend the knee. The rectus femoris also crosses the hip, meaning it is fully stretched only when the hip is extended and the knee is simultaneously flexed (walking lunge rear leg position). Greatest torque-producing leverage for knee extension occurs at approximately 60°–80° of knee flexion, where the patellar tendon moment arm is longest. At full extension (0°) the moment arm becomes very short — this is why the top of a leg extension feels easy and provides minimal stimulus. Setup for cable leg extension: set cable LOW behind the body. Attach an ankle cuff. Sit on a bench facing away from the cable with the knee starting at approximately 80° of flexion — within the peak leverage window. Extend the knee forward to full extension, noting that the final degrees of extension produce progressively less tension. For squats: the quadriceps are maximally stretched at the bottom (approximately 120°–140° of knee flexion) and loaded progressively through the full extension, making the squat superior for total quad development compared to machine leg extensions alone. Terminal knee extension (0°–30° of knee flexion) selectively activates the VMO.

HAMSTRINGS:
The hamstrings perform knee flexion and hip extension. Maximum length occurs when the hip is flexed and the knee simultaneously extended — as in the start of a Nordic curl or the bottom of an RDL. The moment arm for knee flexion peaks at approximately 60°–80° of knee flexion. The hip extension moment arm is greatest when the torso is roughly parallel to the floor at approximately 45°–70° of hip flexion. Setup for cable leg curl: set cable LOW. Attach an ankle cuff. Stand facing the cable machine, holding a support, with the working leg extended behind at approximately 10°–20° of knee flexion (hamstrings stretched under mild hip extension). Curl the heel toward the glute, moving through 60°–80° of knee flexion for peak torque. For prone cable leg curl: lie flat on a bench facing away from the cable, leg extended, and curl from full extension through to approximately 90° of knee flexion. For hip-dominant loading (RDL): hold a barbell or dumbbells, start standing, hinge at the hip maintaining a neutral spine, lower until the torso is approximately parallel to the floor (45°–70° of hip flexion, hamstrings fully stretched), then drive the hips forward to full extension.

GLUTES — GLUTEUS MAXIMUS:
Primary joint actions are hip extension and external rotation. Greatest stretch occurs at approximately 90°+ of hip flexion (bottom of squat, bottom of hip hinge, deep lunge). The moment arm for hip extension — and therefore peak glute torque — is greatest when the hip is near neutral or slightly flexed at approximately 0°–30° of hip flexion, which is the top of a hip thrust or deadlift lockout. Setup for cable glute kickback: set cable LOW. Attach an ankle cuff. Stand facing the cable machine, hinge forward slightly and hold the frame for support, working leg starting with the hip at approximately 90° of flexion (knee in front of the body, fully stretched). Drive the leg rearward through full hip extension until the hip reaches approximately 0°–10° of extension, squeezing at the top. The hip thrust loads the glutes at their greatest torque range (near full extension) while the squat loads them more in the stretched position — both are valid but produce different mechanical profiles. For hip thrust: position the upper back against a bench, bar above the hip crease, start with hips at approximately 90° of flexion, and drive upward to full extension.

CALVES — GASTROCNEMIUS AND SOLEUS:
The gastrocnemius crosses both the knee and ankle, meaning it is only fully active when the knee is straight. Bending the knee slackens the gastrocnemius and shifts work to the soleus. Peak leverage for ankle plantarflexion (for both muscles) occurs at approximately 10°–20° past neutral — starting from a dorsiflexed position (heel below the step edge) and rising through the first portion of plantarflexion. The moment arm shortens rapidly at full plantarflexion. Setup for standing calf raise (gastrocnemius): stand with the ball of the foot on a raised platform, knee completely straight, heel dropped below platform level (full dorsiflexion). Rise through full plantarflexion, then return to the full stretch. Setup for seated calf raise (soleus): sit with the knee bent at approximately 90°, pad resting on the lower thigh, and perform the same plantarflexion from a fully dorsiflexed starting position.

TRAPEZIUS — UPPER, MID, AND LOWER:
The upper trapezius elevates and upwardly rotates the scapula and is most loaded during shrugs with the arms at the sides or at the top of an upright row. The middle trapezius retracts the scapula and is most active during rows performed with the arm at approximately 60°–90° of horizontal abduction (pulling straight back). Setup for mid-trap cable row: set cable at chest height. Sit or stand facing the cable, arm extended in front at shoulder height (90° of shoulder flexion, approximately 0° of horizontal abduction — this is the start). Pull the elbow straight back to approximately 90° of horizontal abduction, squeezing the scapula toward the spine. The lower trapezius depresses and upwardly rotates the scapula and is most active during overhead or elevated-arm exercises — Y-raises on an incline bench with arms at approximately 120°–140° of shoulder elevation, or pullovers that bring the arms from overhead to the sides against resistance.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CABLE SETUP REFERENCE — JOINT ACTIONS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

The cable height determines the line of pull and therefore which joint action is resisted. For shoulder ABDUCTION (lateral raises, middle delt): cable LOW — the upward-angled pull resists the arm raising outward. For shoulder FLEXION (front raises, anterior delt): cable LOW behind the body — the forward-upward arc of the arm is resisted. For shoulder horizontal ADDUCTION (chest fly): cable LOW for upper chest (upward pull matches clavicular fibre direction), cable at shoulder height for mid chest (pure horizontal), cable HIGH for lower chest (downward pull matches lower fibre direction). For shoulder horizontal ABDUCTION (rear delt, face pull): cable HIGH — the rearward arc of the arm is resisted. Never reverse these setups — a LOW cable for rear delts, for example, loads shoulder extension (lats) instead of horizontal abduction (posterior delt).

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

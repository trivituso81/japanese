from pathlib import Path
import json
ROOT=Path(__file__).parent
T=[
[538,'Buddhist transmission to the Yamato court','Often dated to 538; 552 is another traditional date. Buddhism arrived through networks involving the Korean peninsula.','asuka','asuka'],
[645,'Taika reform program','A program associated with centralization; announcing reform was not the same as implementing it everywhere.','asuka','taika'],
[710,'Capital established at Heijo-kyo','The new capital in Nara became a center of court government and temple patronage.','nara','asuka'],
[794,'Court moves to Heian-kyo','The new capital became the center of Heian court culture; power remained geographically layered.','heian','heian'],
[1185,'Minamoto victory in the Genpei War','Warrior institutions developed around this transition. 1192 is another conventional date for the Kamakura founding.','kamakura','kamakura'],
[1192,'Yoritomo receives the shogunal title','The title marks one moment in a longer process of building warrior government.','kamakura','kamakura'],
[1274,'First Mongol-led invasion','Forces of the Mongol empire and its allies attacked northern Kyushu; another invasion followed in 1281.','kamakura','samurai'],
[1333,'Kamakura government falls','A brief imperial restoration followed before the establishment of Ashikaga military rule.','muromachi','kamakura'],
[1467,'Onin War begins','Conflict centered on Kyoto helped intensify fragmentation, though regional developments differed.','sengoku','muromachi'],
[1543,'Portuguese firearms reach Tanegashima','Firearms were adopted and produced within Japan; they interacted with existing military practices.','sengoku','samurai'],
[1588,'Hideyoshi orders a sword hunt','The edict asserted control over weapons and social order; actual implementation needs separate study.','sengoku','swords'],
[1603,'Ieyasu appointed shogun','Tokugawa government combined shogunal authority with the rule of domains.','edo','buke'],
[1615,'Laws of Military Households','Rules governing daimyo expressed the shogunate\'s efforts to regulate warrior elites.','edo','buke'],
[1853,'Perry arrives in Japan','The encounter accelerated an existing crisis; treaty-port commerce followed subsequent agreements.','bakumatsu','fukuzawa'],
[1868,'Meiji Restoration','The fall of Tokugawa rule opened a process of state reconstruction, not an instantaneous completion of modernization.','meiji','oath'],
[1879,'Ryukyu annexed as Okinawa Prefecture','The abolition of the kingdom formed part of an unequal incorporation into the modern Japanese state.','meiji','ryukyu'],
[1889,'Meiji constitution promulgated','The constitution located sovereignty in the emperor and established a particular balance of state institutions.','meiji','meijiconst'],
[1918,'Rice riots','Protests over rice prices connected household provisioning with political legitimacy.','taisho','rice'],
[1923,'Great Kanto Earthquake','The disaster was followed by deadly violence against Koreans and others amid false rumors.','taisho','kanto'],
[1925,'Male franchise expanded','The removal of the property qualification did not enfranchise women; the Peace Preservation Law also strengthened repression.','taisho','suffrage'],
[1931,'Manchurian Incident','Kwantung Army officers staged an explosion and used it to justify military expansion.','war','manchuria'],
[1945,'Japan surrenders','Surrender was announced on August 15; the formal signing took place on September 2. Human consequences continued.','war','hiroshima'],
[1947,'Postwar constitution takes effect','Popular sovereignty, rights, and the symbolic emperor replaced the Meiji constitutional framework.','postwar','constitution'],
[1956,'Minamata disease officially reported','Recognition of the pollution and accountability unfolded through a prolonged struggle.','postwar','minamata'],
[1972,'Okinawa returns to Japanese administration','The mainland occupation had ended in 1952. Regional timelines matter.','postwar','okinawa1972'],
[1989,'Heisei era begins','A new era name did not replace the postwar constitution.','heisei','constitution'],
[2011,'Great East Japan Earthquake','The earthquake, tsunami, and nuclear accident had distinct but connected consequences.','heisei','quake'],
[2019,'Reiwa era begins','Official era dating changed while the postwar constitutional system continued.','reiwa','constitution'],
[2026,'Takaichi designated prime minister, February 18','This dated event is documented by the Prime Minister\'s Office; this app is not a live officeholder tracker.','reiwa','pm2026']]
SC=[]
def scenario(id,era,title,role,intro,refs,steps):
 SC.append(dict(id=id,era=era,title=title,role=role,intro=intro,refs=refs,steps=steps))
def step(title,text,low,choices):return dict(title=title,text=text,low=low,choices=[dict(label=a,result=b,delta=c) for a,b,c in choices])
scenario('winter','jomon','Before the winter','A member of a coastal household','Autumn is ending. Your group must balance stores, relationships, and knowledge of the shore. This is an imagined situation, not a recovered Jomon conversation.',['jomon','pottery'],[
step('The tide gives you a choice','There is time for one substantial task today. What will you prioritize?','Supplies are thin; the choice now feels less comfortable.',[
('Gather and process food','You increase immediate stores, but spend time that could have supported other relationships.',[2,0,0]),
('Help another household repair its gear','There is less food to show tonight, but you strengthen a reciprocal relationship.',[-1,2,1]),
('Explore a different stretch of coast','You learn a new resource location. Exploration takes time and does not guarantee an immediate return.',[-1,0,3])]),
step('Visitors at the hearth','A neighboring group arrives while your household is preparing food.','Your stores are low, so sharing involves a real sacrifice.',[
('Share a portion and exchange news','Some food leaves your stores. In return, relationships and environmental information may become more useful.',[-1,2,1]),
('Exchange toolmaking knowledge','You focus on a skill exchange rather than a large meal. Cooperation need not require currency.',[0,1,2]),
('Keep most stores for the household','You preserve a buffer, but an opportunity for closer exchange passes.',[1,-1,0])]),
step('What will tomorrow remember?','You want to pass useful knowledge to a younger member of the group.','Limited stores make knowledge about reliable resources especially valuable.',[
('Practice food processing together','Hands-on repetition connects a material skill with the seasons.',[1,0,2]),
('Visit a neighboring household together','You pass on relationships as well as instructions.',[0,2,1]),
('Revisit the newly explored coast','You invest in environmental knowledge whose payoff may arrive later.',[-1,0,3])])])
scenario('letter','heian','The letter before sunrise','A fictional junior attendant','A household at court needs a carefully judged reply. Literary skill matters, but so do rank, timing, and the labor that supports elegance.',['heian','yamatoe'],[
step('A delicate reply','A senior attendant asks for help preparing a response.','Your household\'s resources are limited; even a polished response has material costs.',[
('Ask about the relationship first','You learn why the recipient and occasion matter before choosing words.',[0,1,2]),
('Choose elaborate paper and presentation','Presentation may signal care, but it consumes valuable material.',[-2,2,0]),
('Prepare a concise draft quickly','You conserve supplies and meet the immediate deadline, with less time to investigate nuance.',[1,0,1])]),
step('An allusion you do not recognize','The proposed poem refers to an older work.','A mistake could be socially costly when other resources are scarce.',[
('Consult an experienced attendant','You acknowledge a gap and draw on a relationship to interpret the reference.',[0,1,2]),
('Use an allusion you understand well','You choose control over display. Familiar material can still be adapted thoughtfully.',[1,0,1]),
('Ask a peer to work through it together','Interpretation becomes cooperative; the peer gains a reason to help again.',[0,2,1])]),
step('Who made the polished result possible?','The reply is ready, but delivery requires other people\'s work.','There is little room for waste, so coordination matters.',[
('Coordinate with the messenger','Timely delivery connects literary expression with practical organization.',[1,1,1]),
('Credit the people who helped','You make supporting labor visible and strengthen relationships within the household.',[0,2,1]),
('Record what you learned for next time','You turn this occasion into a resource for future interpretation.',[0,0,3])])])
scenario('petition','kamakura','One field, two claims','A fictional estate intermediary','A cultivator, a steward, and a distant estate holder disagree over obligations. There is no simple map with one owner and one unquestioned right.',['kamakura','samurai'],[
step('Before the argument','Each party insists that its claim is obvious. How do you begin?','A weak resource position makes a prolonged dispute harder to sustain.',[
('Collect existing records','Documents may clarify obligations, though they also preserve the interests of their creators.',[-1,0,3]),
('Listen separately to the parties','You learn how the dispute looks from different positions and create space for negotiation.',[0,2,1]),
('Inspect the harvest situation','Practical conditions reveal what can actually be extracted without undermining cultivation.',[2,0,1])]),
step('The immediate payment','The steward seeks a payment before all claims have been resolved.','The household has little surplus, so every demand has consequences.',[
('Negotiate a temporary arrangement','A provisional compromise can keep production going without settling every legal issue.',[1,1,1]),
('Request a formal review','You invest in clarifying authority, at the cost of time and resources.',[-2,0,3]),
('Seek support from another interested party','A wider network can add influence, but creates new relationships and obligations.',[-1,3,0])]),
step('Make the outcome usable','An agreement that nobody understands may generate another dispute.','Limited resources make a repeat conflict especially costly.',[
('Write down the obligations','A record supports future claims but must still be interpreted and enforced.',[0,1,2]),
('Explain the arrangement locally','Shared understanding makes implementation more plausible.',[0,2,1]),
('Check the demands against the next harvest','You connect formal obligations with the productive limits of the field.',[2,0,1])])])
scenario('print','edo','A print shop on a deadline','A fictional apprentice in a city shop','A new print has customers waiting. Your work depends on craftspeople, suppliers, regulations, and the habits of a crowded city.',['classes','porcelain','hagakure'],[
step('What will catch attention?','The shop needs a subject that can find an audience.','Materials are scarce, so a failed edition would hurt.',[
('Study what customers ask about','Audience knowledge can guide a choice, though demand is never guaranteed.',[1,0,2]),
('Consult the experienced designer','The relationship can improve judgment and quality.',[-1,2,1]),
('Reuse a familiar theme with a new detail','You reduce risk and material waste, at the cost of less novelty.',[2,0,0])]),
step('A problem with the paper','The delivery is smaller than expected.','With few supplies left, coordination matters more than speed.',[
('Reduce the first print run','You conserve materials while learning whether customers respond.',[2,0,1]),
('Negotiate another delivery','A supplier relationship becomes part of the production process.',[-1,2,1]),
('Coordinate carefully with the printer','Better preparation may reduce waste without creating more paper.',[1,1,1])]),
step('Reading the finished print','A customer asks what the image says about city life.','Your narrow margin is a reminder that art also has a material economy.',[
('Discuss the people and work behind it','You connect the visible image with the network that produced it.',[0,1,2]),
('Explain that it is a selected viewpoint','A fashionable image is evidence of representation, not a photograph of every household.',[0,0,3]),
('Listen to the customer\'s interpretation','Reception can differ from the maker\'s intention and teach the shop something new.',[0,2,1])])])
scenario('school','meiji','A household at a crossroads','A fictional rural household member','Schooling and new obligations arrive together. Choices about work and education take place under unequal resources, not in a world of unlimited options.',['oath','silk','meijiconst'],[
step('The school day and the workday','A child\'s schooling competes with tasks the household depends on.','There is little financial slack to absorb a change.',[
('Reorganize work with relatives','A network may make attendance possible, while shifting work onto someone else.',[0,2,1]),
('Prioritize attendance and accept a short-term loss','Education may expand future opportunities, but its immediate cost is real.',[-2,0,3]),
('Investigate the school\'s actual requirements','You avoid assuming that national policy operates identically in every locality.',[1,0,2])]),
step('An offer from a textile employer','A work opportunity could bring cash and take someone away from home.','A pressing need for income narrows the room to negotiate.',[
('Ask about pay, conditions, and obligations','The contract is part of a labor relationship, not merely a wage number.',[0,0,3]),
('Speak with people who have worked there','Experience can reveal details missing from a recruiter\'s description.',[0,2,1]),
('Compare the offer with local options','The meaning of a choice depends on what alternatives exist.',[1,0,2])]),
step('Who bears the adjustment?','The household plan distributes new responsibilities.','Scarce resources make unpaid work easy to overlook.',[
('Make unpaid labor explicit','You notice whose education or rest might be sacrificed to support another person\'s opportunity.',[0,1,2]),
('Agree on mutual support with relatives','A shared plan can spread risks, while creating reciprocal obligations.',[0,3,0]),
('Keep a record of income and obligations','A material record helps distinguish expectations from actual outcomes.',[2,0,1])])])
scenario('recovery','postwar','More than rebuilding','A fictional neighborhood organizer','A community is deciding what reconstruction should mean. The scenario is a composite, not a simulation of the trauma of a particular disaster.',['constitution','reconstruction','minamata'],[
step('Who is in the room?','A planning meeting needs to identify priorities.','Funding is limited, so missed needs may be costly later.',[
('Invite people whose schedules exclude them','Broader participation takes effort and may reveal invisible constraints.',[-1,3,1]),
('Begin with a survey of urgent needs','Evidence can improve allocation, provided the survey reaches different households.',[1,1,2]),
('Repair the most widely used shared facility first','An immediate benefit may build confidence, while leaving other needs unresolved.',[2,1,0])]),
step('An impressive proposal','A large project looks compelling in a presentation.','Limited funds heighten the consequences of choosing the wrong priority.',[
('Ask who benefits and who pays','You examine distribution rather than only the total headline benefit.',[0,1,3]),
('Compare it with several smaller interventions','An alternative may serve different groups more effectively.',[2,0,1]),
('Organize a discussion with affected residents','Legitimacy and local knowledge may improve the decision.',[-1,3,1])]),
step('Define success','The committee needs a way to judge progress.','A narrow budget makes honest evaluation especially useful.',[
('Measure access as well as construction','A completed facility matters only if people can actually use it.',[1,1,2]),
('Ask residents about livelihoods and social ties','Recovery includes relationships and viable lives, not only buildings.',[0,2,2]),
('Publish what remains unresolved','Transparency can sustain accountability without pretending every problem has ended.',[0,2,1])])])
P=[
['\u3059\u307f\u307e\u305b\u3093','Sumimasen','Excuse me / sorry','You need to attract a museum attendant\'s attention.','A flexible polite opener; its function depends on context.'],
['\u3042\u308a\u304c\u3068\u3046\u3054\u3056\u3044\u307e\u3059','Arigato gozaimasu','Thank you (polite)','A guide has helped you understand a display.','The longer form fits a polite interaction with someone you do not know well.'],
['\u3082\u3046\u4e00\u5ea6\u304a\u9858\u3044\u3057\u307e\u3059','Mo ichido onegai shimasu','Once more, please','You did not catch what the guide said.','The thing to repeat is understood from the situation.'],
['\u3086\u3063\u304f\u308a\u304a\u9858\u3044\u3057\u307e\u3059','Yukkuri onegai shimasu','Slowly, please','Someone is speaking too quickly for you.','A context-dependent request to slow down.'],
['\u3053\u308c\u306f\u4f55\u3067\u3059\u304b','Kore wa nan desu ka','What is this?','You are looking at an unfamiliar object.','Use the context to make clear what kore refers to.'],
['\u3044\u3064\u306e\u6642\u4ee3\u3067\u3059\u304b','Itsu no jidai desu ka','What period is it from?','You want to place an artifact on a timeline.','A contemporary question, not a historical quotation.'],
['\u65e5\u672c\u8a9e\u3092\u52c9\u5f37\u3057\u3066\u3044\u307e\u3059','Nihongo o benkyo shite imasu','I am studying Japanese','You explain why you are asking for a slower explanation.','A polite statement about your ongoing study.'],
['\u308f\u304b\u308a\u307e\u305b\u3093','Wakarimasen','I do not understand','You need to make a comprehension problem clear.','Admitting a gap supports learning; pretending understanding does not.'],
['\u3069\u3053\u3067\u3059\u304b','Doko desu ka','Where is it?','The place being discussed is clear, but you need its location.','The topic can be supplied explicitly or understood from context.'],
['\u304a\u5148\u306b\u5931\u793c\u3057\u307e\u3059','Osaki ni shitsurei shimasu','Excuse me for leaving before you','You leave a workplace while colleagues remain.','Common workplace usage, not a universal goodbye for every situation.'],
['\u304a\u75b2\u308c\u3055\u307e\u3067\u3059','Otsukaresama desu','An acknowledgment of shared work','You greet a colleague in a work-related interaction.','Often translated loosely; it is not a literal diagnosis of tiredness.'],
['\u3088\u308d\u3057\u304f\u304a\u9858\u3044\u3057\u307e\u3059','Yoroshiku onegai shimasu','A context-dependent request for goodwill or cooperation','You begin working with a new collaborator.','There is no one English translation suitable for every use.']]
ROOT.joinpath('activities.json').write_text(json.dumps(dict(timeline=T,scenarios=SC,phrases=P),ensure_ascii=False),encoding='utf-8')

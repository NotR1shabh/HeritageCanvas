// client/src/components/Flashcards.jsx
import React, { useState, useEffect } from 'react';

const harivamsaFlashcards = [
  { front: "Birth of the Yadu Lineage", back: `<div class="back-content"><h2 style="font-size: 1.5rem; font-weight: 700; margin-bottom: 0.75rem; text-align: center;">The Yadu Dynasty</h2><p>The mighty Yadu dynasty was founded by King Yadu, descendant of the Moon god. From this divine line, Lord Krishna would one day take birth to restore dharma on earth.</p></div>`, image: "/images/Harivamsa/The Enternal Harivamsa_.jpg" },
  { front: "Prophecy of Krishna's Birth", back: `<div class="back-content"><h2 style="font-size: 1.5rem; font-weight: 700; margin-bottom: 0.75rem; text-align: center;">Kansa's Fear</h2><p>King Kansa of Mathura feared a prophecy—that Devaki's eighth child would end his life. Blinded by terror, he imprisoned Devaki and her husband, Vasudeva.</p></div>`, image: "/images/Harivamsa/King_Kansa.jpg" },
  { front: "Birth of Lord Krishna", back: `<div class="back-content"><h2 style="font-size: 1.5rem; font-weight: 700; margin-bottom: 0.75rem; text-align: center;">The Divine Midnight</h2><p>At midnight, in the prison of Mathura, the divine child Krishna was born. The chains fell open, guards slept, and Vasudeva carried the infant across the Yamuna to Gokul.</p></div><p style="margin-top: 1.25rem; padding: 0.9rem; background: rgba(255,255,255,0.1); border-left: 4px solid rgba(255,255,255,0.5); font-style: italic; font-size: 0.9rem;"><span style="color: #ffd700; font-weight: 800; font-size: 1.25rem;">ॐ</span><br/>"परित्राणाय साधूनां विनाशाय च दुष्कृताम्।"<br/>For the protection of the good and the destruction of the wicked, I take birth age after age.</p>`, image: "/images/Harivamsa/Birth_of_krishna.jpg" },
  { front: "Infant in Gokul", back: `<div class="back-content"><h2 style="font-size: 1.5rem; font-weight: 700; margin-bottom: 0.75rem; text-align: center;">Nanda and Yashoda</h2><p>Krishna was raised by Nanda and Yashoda in Gokul. His childhood was filled with divine playfulness—adored by all and feared by the wicked.</p></div>`, image: "/images/Harivamsa/Infant_in_gokul.jpg" },
  { front: "Killing of Putana", back: `<div class="back-content"><h2 style="font-size: 1.5rem; font-weight: 700; margin-bottom: 0.75rem; text-align: center;">Defeat of the Demoness</h2><p>The demoness Putana came disguised as a mother to kill Krishna by feeding him poison, but the divine infant sucked out her very life, freeing her soul.</p></div>`, image: "/images/Harivamsa/Killing_of_putna.jpg" },
  { front: "The Makhan Chor", back: `<div class="back-content"><h2 style="font-size: 1.5rem; font-weight: 700; margin-bottom: 0.75rem; text-align: center;">Mischievous Butter Thief</h2><p>Little Krishna, known for his mischievous love of butter, enchanted everyone with his innocence. His divine leelas were glimpses of joy beyond reason.</p></div>`, image: "/images/Harivamsa/Makhan_chor.jpg" },
  { front: "Meeting of Radha and Krishna", back: `<div class="back-content"><h2 style="font-size: 1.5rem; font-weight: 700; margin-bottom: 0.75rem; text-align: center;">Eternal Souls Meet</h2><p>On the banks of the Yamuna, the eternal souls met—Radha and Krishna. Their eyes spoke a language beyond words; creation stood still. Their love was not of this world—it was the very essence of the divine.</p></div><p style="margin-top: 1.25rem; padding: 0.9rem; background: rgba(255,255,255,0.1); border-left: 4px solid rgba(255,255,255,0.5); font-style: italic; font-size: 0.9rem;"><span style="color: #ffd700; font-weight: 800; font-size: 1.25rem;">ॐ</span><br/>"राधा कृष्ण एक आत्मा द्वे देहे विभज्यते।"<br/>Radha and Krishna are one soul, manifest in two bodies.</p>`, image: "/images/Harivamsa/Meeting_of_radha_krishna.jpg" },
  { front: "Rasa Leela—The Dance Divine", back: `<div class="back-content"><h2 style="font-size: 1.5rem; font-weight: 700; margin-bottom: 0.75rem; text-align: center;">The Dance of Infinity</h2><p>Under the full moon, Krishna multiplied himself so each Gopi felt him as her own. Yet only Radha's heart held him completely—her love was boundless, selfless, and eternal.</p></div><p style="margin-top: 1.25rem; padding: 0.9rem; background: rgba(255,255,255,0.1); border-left: 4px solid rgba(255,255,255,0.5); font-style: italic; font-size: 0.9rem;"><span style="color: #ffd700; font-weight: 800; font-size: 1.25rem;">ॐ</span><br/>"प्रेम ही परं तत्वं।"<br/>Love is the supreme truth.</p>`, image: "/images/Harivamsa/Ras_leela.jpg" },
  { front: "Radha's Eternal Devotion", back: `<div class="back-content"><h2 style="font-size: 1.5rem; font-weight: 700; margin-bottom: 0.75rem; text-align: center;">Love Turned Inward</h2><p>When Krishna left for Mathura, Radha stayed—her love turned inward, transforming into pure devotion. Though separated, their souls were never apart. Her silence became the sound of bhakti for all ages.</p></div>`, image: "/images/Harivamsa/Radha_eternal_devotion.jpg" },
  { front: "Kaliya Mardan", back: `<div class="back-content"><h2 style="font-size: 1.5rem; font-weight: 700; margin-bottom: 0.75rem; text-align: center;">Taming the Serpent</h2><p>Krishna danced upon the hoods of the venomous serpent Kaliya, purifying the Yamuna and restoring peace. The serpent surrendered, worshipping the Lord.</p></div><p style="margin-top: 1.25rem; padding: 0.9rem; background: rgba(255,255,255,0.1); border-left: 4px solid rgba(255,255,255,0.5); font-style: italic; font-size: 0.9rem;"><span style="color: #ffd700; font-weight: 800; font-size: 1.25rem;">ॐ</span><br/>"मां हि पार्थ व्यपाश्रित्य येऽपि स्यु: पापयोनयः।"<br/>Even the sinful who surrender unto Me attain the supreme path.</p>`, image: "/images/Harivamsa/Kaliya_mardan.jpg" },
  { front: "Govardhan Leela", back: `<div class="back-content"><h2 style="font-size: 1.5rem; font-weight: 700; margin-bottom: 0.75rem; text-align: center;">Lifting the Hill</h2><p>When Indra's pride brought storms upon Gokul, Krishna lifted the Govardhan Hill on his little finger, sheltering all beneath it for seven days.</p></div>`, image: "/images/Harivamsa/Govardhan.jpg" },
  { front: "End of Kansa", back: `<div class="back-content"><h2 style="font-size: 1.5rem; font-weight: 700; margin-bottom: 0.75rem; text-align: center;">The Prophecy Fulfilled</h2><p>Krishna returned to Mathura, broke Kansa's tyranny, and freed his parents. The prophecy was fulfilled—righteousness triumphed over arrogance.</p></div><p style="margin-top: 1.25rem; padding: 0.9rem; background: rgba(255,255,255,0.1); border-left: 4px solid rgba(255,255,255,0.5); font-style: italic; font-size: 0.9rem;"><span style="color: #ffd700; font-weight: 800; font-size: 1.25rem;">ॐ</span><br/>"दिव्यं ददाति भगवान् धर्मसंस्थापनार्थकं।"<br/>The Lord bestows divinity to re-establish righteousness on earth.</p>`, image: "/images/Harivamsa/End of Kansa.jpg" },
  { front: "Rukmini's Love", back: `<div class="back-content"><h2 style="font-size: 1.5rem; font-weight: 700; margin-bottom: 0.75rem; text-align: center;">The Abduction and Union</h2><p>Princess Rukmini, devoted to Krishna, sent him a heartfelt letter. Krishna arrived in glory and carried her away, defeating all who opposed their divine union.</p></div>`, image: "/images/Harivamsa/Rukmini_s Love.jpg" },
  { front: "Krishna's Marriages and Kingdom", back: `<div class="back-content"><h2 style="font-size: 1.5rem; font-weight: 700; margin-bottom: 0.75rem; text-align: center;">Dwaraka</h2><p>Krishna ruled in Dwaraka, marrying Rukmini, Satyabhama, and other queens. Each union symbolized a divine truth—love, devotion, and cosmic balance.</p></div>`, image: "/images/Harivamsa/Krishna_s marriages and kingdom.jpg" },
  { front: "The Syamantaka Jewel", back: `<div class="back-content"><h2 style="font-size: 1.5rem; font-weight: 700; margin-bottom: 0.75rem; text-align: center;">Clearing the Name</h2><p>The Syamantaka gem caused suspicion and strife. Krishna retrieved it from a lion and cleared his name, showing that truth always dispels illusion.</p></div><p style="margin-top: 1.25rem; padding: 0.9rem; background: rgba(255,255,255,0.1); border-left: 4px solid rgba(255,255,255,0.5); font-style: italic; font-size: 0.9rem;"><span style="color: #ffd700; font-weight: 800; font-size: 1.25rem;">ॐ</span><br/>"सत्यं परं धीमहि।"<br/>We meditate upon the Supreme Truth.</p>`, image: "/images/Harivamsa/Narakasura_s Fall(1).jpg" },
  { front: "Narakasura's Fall", back: `<div class="back-content"><h2 style="font-size: 1.5rem; font-weight: 700; margin-bottom: 0.75rem; text-align: center;">Liberation</h2><p>Krishna and Satyabhama destroyed the demon Narakasura, freeing thousands of captive princesses—symbolizing liberation of souls from bondage.</p></div><p style="margin-top: 1.25rem; padding: 0.9rem; background: rgba(255,255,255,0.1); border-left: 4px solid rgba(255,255,255,0.5); font-style: italic; font-size: 0.9rem;"><span style="color: #ffd700; font-weight: 800; font-size: 1.25rem;">ॐ</span><br/>"सत्यं परं धीमहि।"<br/>We meditate upon the Supreme Truth.</p>`, image: "/images/Harivamsa/Narakasura_s Fall.jpg" },
  { front: "Uddhava Gita", back: `<div class="back-content"><h2 style="font-size: 1.5rem; font-weight: 700; margin-bottom: 0.75rem; text-align: center;">The Path of Detachment</h2><p>Krishna imparted wisdom to Uddhava—the path of detachment, devotion, and seeing the Lord in all beings.</p></div>`, image: "/images/Harivamsa/Uddhava Gita.jpg" },
  { front: "Friend and Guide of Pandavas", back: `<div class="back-content"><h2 style="font-size: 1.5rem; font-weight: 700; margin-bottom: 0.75rem; text-align: center;">Arjun's Charioteer</h2><p>In the great Mahabharata, Krishna became Arjun's charioteer—not a ruler, but a guide. His counsel would echo through eternity as the Bhagavad Gita.</p></div><p style="margin-top: 1.25rem; padding: 0.9rem; background: rgba(255,255,255,0.1); border-left: 4px solid rgba(255,255,255,0.5); font-style: italic; font-size: 0.9rem;"><span style="color: #ffd700; font-weight: 800; font-size: 1.25rem;">ॐ</span><br/>"अहं सर्वस्य प्रभवो मत्तः सर्वं प्रवर्तते।"<br/>I am the source of all creation; everything emanates from Me.</p>`, image: "/images/Harivamsa/Friend and Guide of Pandavas_.jpg" },
  { front: "The Vishvarupa", back: `<div class="back-content"><h2 style="font-size: 1.5rem; font-weight: 700; margin-bottom: 0.75rem; text-align: center;">The Universal Form</h2><p>On the battlefield, Krishna revealed his universal form—countless faces, infinite light. Arjun saw the truth: the universe itself was Krishna.</p></div>`, image: "/images/Harivamsa/The Vishvarupa_.jpg" },
  { front: "Final Days in Dwaraka", back: `<div class="back-content"><h2 style="font-size: 1.5rem; font-weight: 700; margin-bottom: 0.75rem; text-align: center;">Acceptance of Destiny</h2><p>The Yadava clan fell to strife. Krishna, serene and unshaken, accepted destiny—a reminder that even avatars withdraw when their purpose is fulfilled.</p></div>`, image: "/images/Harivamsa/Final Day_s in Dwaraka_.jpg" },
  { front: "The Departure of Krishna", back: `<div class="back-content"><h2 style="font-size: 1.5rem; font-weight: 700; margin-bottom: 0.75rem; text-align: center;">Returning to Vaikuntha</h2><p>Resting beneath a tree, Krishna was struck by a hunter's arrow. Smiling, He left His mortal form—returning to His eternal abode with Radha awaiting beyond time.</p></div><p style="margin-top: 1.25rem; padding: 0.9rem; background: rgba(255,255,255,0.1); border-left: 4px solid rgba(255,255,255,0.5); font-style: italic; font-size: 0.9rem;"><span style="color: #ffd700; font-weight: 800; font-size: 1.25rem;">ॐ</span><br/>"न जायते म्रियते वा कदाचित्।"<br/>The soul is never born, nor does it ever die.</p>`, image: "/images/Harivamsa/The Departure of Krishna_.jpg" },
  { front: "The Eternal Harivamsa", back: `<div class="back-content"><h2 style="font-size: 1.5rem; font-weight: 700; margin-bottom: 0.75rem; text-align: center;">The Divine Song</h2><p>Thus ends the Harivamsa—the sacred lineage of Hari. Through Krishna's life and leelas, mankind learns that love, devotion, and truth are the highest forms of dharma.</p></div><p style="margin-top: 1.25rem; padding: 0.9rem; background: rgba(255,255,255,0.1); border-left: 4px solid rgba(255,255,255,0.5); font-style: italic; font-size: 0.9rem;"><span style="color: #ffd700; font-weight: 800; font-size: 1.25rem;">ॐ</span><br/>"भक्त्या मामभिजानाति यावान्यश्चास्मि तत्त्वतः।"<br/>Only through devotion can one truly know Me as I am.</p>`, image: "/images/Harivamsa/The Enternal Harivamsa_.jpg" }
];

const ramayanFlashcards = [
  { front: "Ram's Birth", back: `Lord Vishnu incarnated as Shri Ram in Ayodhya, born to Queen Kaushalya and King Dasharath. The kingdom rejoiced at the divine birth.`, image: '/images/Ramayan/Rams_birth.jpg' },
  { front: "Ram & Brothers", back: `Ram grew up with his three brothers – Bharat, Lakshman, and Shatrughna. Together, they received education in scriptures, warfare, and dharma.`, image: '/images/Ramayan/Ram_and_brothers.jpg' },
  { front: "Sita Swayamvar", back: `In Mithila, Ram broke Lord Shiva's mighty bow during Sita's swayamvar, thus winning her hand in marriage.`, image: '/images/Ramayan/Sita_swayamvar.jpg' },
  { front: "Exile Begins", back: `Due to Queen Kaikeyi's boon, Ram was exiled for 14 years. Sita and Lakshman chose to accompany him, leaving Ayodhya in sorrow.`, image: '/images/Ramayan/Exhile_begins.jpg' },
  { front: "Life in Forest", back: `During exile, Ram, Sita, and Lakshman lived in hermitages, met sages, and protected them by defeating demons in the forests.`, image: '/images/Ramayan/Life_in_forest.jpg' },
  { front: "Sita Abduction", back: `Ravan tricked Sita by sending Marich as a golden deer. While Ram and Lakshman were away, Ravan abducted Sita and took her to Lanka.`, image: '/images/Ramayan/Sita_adbuction.jpg' },
  { front: "Ram Meets Hanuman", back: `Searching for Sita, Ram met Hanuman and Sugriva. Hanuman pledged eternal devotion to Ram and promised to help rescue Sita.`, image: '/images/Ramayan/Ram_meets_hanuman.jpg' },
  { front: "Hanuman in Lanka", back: `Hanuman leapt across the ocean, met Sita in Ashok Vatika, gave her Ram's ring, and reassured her. Later, he set Lanka ablaze before returning.`, image: '/images/Ramayan/Hanuman_in_lanka.jpg' },
  { front: "Ram Setu", back: `Under Ram's command, the Vanara army built a stone bridge across the ocean, known as Ram Setu, to reach Lanka.`, image: '/images/Ramayan/Ram_setu.jpg' },
  { front: "Battle with Ravan", back: `A fierce battle was fought between Ram's army and Ravan's forces. Finally, Ram killed Ravan, ending his reign of adharma.`, image: '/images/Ramayan/Battle_with_ravan.jpg' },
  { front: "Ram–Sita Reunion", back: `After the war, Ram reunited with Sita. She proved her purity through the Agni Pariksha, and Ram accepted her once again.`, image: '/images/Ramayan/Ram_sita_reunion.jpg' },
  { front: "Return to Ayodhya", back: `With the exile completed, Ram, Sita, and Lakshman returned to Ayodhya in Pushpak Viman. The citizens welcomed them with joy.`, image: '/images/Ramayan/Return_to_ayodhya.jpg' },
  { front: "Diwali Celebrations", back: `To celebrate Ram's return and the victory of dharma over evil, the people of Ayodhya lit lamps. This tradition continues as Diwali.`, image: '/images/Ramayan/Diwali_celebrations.jpg' }
];

const mahabharataFlashcards = [
  { front: "The Birth of Princes", back: `In Hastinapur, King Pandu and Queen Kunti were blessed with five divine sons — the Pandavas. Dhritarashtra and Gandhari had a hundred sons — the Kauravas. Thus began the lineage destined for glory and destruction.`, image: '/images/Mahabharata/The_birth_of_princes.png' },
  { front: "Training Under Dronacharya", back: `The princes mastered archery and warfare under Guru Dronacharya. Arjun shone brightest, becoming his most devoted and skilled student, while jealousy brewed within Duryodhan's heart.`, image: '/images/Mahabharata/Training_under_Dronacharya.png' },
  { front: "Ekalavya's Sacrifice", back: `A tribal boy, Ekalavya, mastered archery by worshipping Drona's idol. When asked for guru dakshina, he cut off his own thumb, proving devotion beyond imagination.`, image: '/images/Mahabharata/Ikalavaya_sacrifice.png' },
  { front: "The Burning Wax Palace", back: `The Kauravas, fearing the Pandavas' rise, built a wax palace to burn them alive. But the Pandavas escaped the fiery trap, living in disguise to protect their fate.`, image: '/images/Mahabharata/The burning wax palace .png' },
  { front: "The Swayamvar of Draupadi", back: `At King Drupad's court, Arjun pierced the eye of a moving fish to win Draupadi's hand. Her marriage to all five Pandavas became the turning point of destiny.`, image: '/images/Mahabharata/The_Swayamvar_of_Draupadi.png' },
  { front: "The Kuru Kingdom Divided", back: `Dhritarashtra divided the kingdom. The Pandavas received barren Khandavprastha, which they turned into the magnificent city of Indraprastha — a symbol of righteousness and prosperity.`, image: '/images/Mahabharata/Kuru_kingdon_divided.jpg' },
  { front: "The Game of Dice", back: `Tricked by Shakuni's cunning, Yudhishthir gambled away his kingdom, his brothers, and even Draupadi. The dice of deceit rolled the first cries of war.`, image: '/images/Mahabharata/The_game_of_dice.png' },
  { front: "Draupadi's Humiliation", back: `In the royal court, Duryodhan tried to disrobe Draupadi. She called upon Lord Krishna, who protected her honor endlessly, filling the hall with divine radiance.`, image: '/images/Mahabharata/Draupadi_Humiliation.png' },
  { front: "Vow of Vengeance", back: `Humiliated and broken, Draupadi swore that her hair would remain untied until it was washed in Dushasan's blood. The Pandavas vowed to avenge her dishonor.`, image: '/images/Mahabharata/Vow of vengeance _edit_163654213504757.png' },
  { front: "The Exile Years", back: `The Pandavas spent 13 long years in exile, enduring hardships, gaining wisdom, and forming alliances. Arjun acquired divine weapons; Bhim met Hanuman; and Krishna guided them through despair.`, image: '/images/Mahabharata/The_exile_years.jpg' },
  { front: "Krishna's Counsel", back: `When peace negotiations failed, Krishna offered his army to one side and himself, weaponless, to the other. Arjun chose Krishna as his charioteer, sealing his path toward destiny.`, image: '/images/Mahabharata/Krishna_Counsel.png' },
  { front: "The Battlefield of Kurukshetra", back: `Two mighty armies faced each other — the Pandavas and Kauravas, kin against kin, dharma against adharma. The earth trembled, and time stood still as war began.`, image: '/images/Mahabharata/The_battlefield_of_kuruksheta.png' },
  { front: "Arjun's Despair", back: `Seeing his own relatives on the battlefield, Arjun's heart wavered. He dropped his bow, questioning the meaning of duty and righteousness.<br/><p style="margin-top: 1.25rem; padding: 0.9rem; background: rgba(255,255,255,0.1); border-left: 4px solid rgba(255,255,255,0.5); font-style: italic; font-size: 0.9rem;"><span style="color: #ffd700; font-weight: 800; font-size: 1.25rem;">ॐ</span><br/>"कर्मण्येवाधिकारस्ते मा फलेषु कदाचन।"<br/>You have the right to perform your duty, but not to the fruits of your actions.</p>`, image: '/images/Mahabharata/Arjun_despair.png' },
  { front: "The Song of the Gita", back: `Krishna revealed the eternal truth — life and death are illusions; the soul is immortal. He urged Arjun to rise, fight, and uphold dharma.<br/><p style="margin-top: 1.25rem; padding: 0.9rem; background: rgba(255,255,255,0.1); border-left: 4px solid rgba(255,255,255,0.5); font-style: italic; font-size: 0.9rem;"><span style="color: #ffd700; font-weight: 800; font-size: 1.25rem;">ॐ</span><br/>"नैनं छिन्दन्ति शस्त्राणि नैनं दहति पावकः।"<br/>Weapons cannot cut the soul, fire cannot burn it.</p>`, image: '/images/Mahabharata/The_song_of_the_Gita.png' },
  { front: "The War Commences", back: `With the conch shells roaring, the great Mahabharata war began. Heroes clashed, arrows darkened the skies, and dharma battled for its survival.`, image: '/images/Mahabharata/The_war_commence.png' },
  { front: "Bhishma's Fall", back: `Bound by his vow, Bhishma fought fiercely for the Kauravas until Arjun, guided by Shikhandi, brought him down on a bed of arrows — the grandsire's final rest.`, image: '/images/Mahabharata/Bishma_Fall.png' },
  { front: "Drona's Death", back: `Tricked by the false news of his son Ashwatthama's death, Drona laid down his arms. Dhrishtadyumna beheaded him, ending the might of the guru's wrath.`, image: '/images/Mahabharata/Drona_Death.png' },
  { front: "Karna's Fate", back: `Arjun faced his greatest rival, Karna — the unsung son of Kunti. When Karna's chariot wheel sank, Arjun, urged by Krishna, released the fatal arrow.<br/><p style="margin-top: 1.25rem; padding: 0.9rem; background: rgba(255,255,255,0.1); border-left: 4px solid rgba(255,255,255,0.5); font-style: italic; font-size: 0.9rem;"><span style="color: #ffd700; font-weight: 800; font-size: 1.25rem;">ॐ</span><br/>"सर्वधर्मान्परित्यज्य मामेकं शरणं व्रज।"<br/>Abandon all duties and surrender unto Me alone.</p>`, image: '/images/Mahabharata/Karna_fate.png' },
  { front: "Abhimanyu's Sacrifice", back: `The young Abhimanyu broke into the Chakravyuha formation but was surrounded and slain mercilessly. His valor became immortal, echoing through generations.`, image: '/images/Mahabharata/Abhimanyu_sacrifice.png' },
  { front: "The Death of Duryodhan", back: `Bhim met Duryodhan in a fierce mace duel. Remembering his vow, Bhim struck Duryodhan on the thigh — ending his tyranny and fulfilling Draupadi's oath.`, image: '/images/Mahabharata/Death_of_Duryodhan.png' },
  { front: "The Fall of the Warriors", back: `The battlefield lay silent. Blood, valor, and sacrifice marked the soil of Kurukshetra. Victory came, but at the cost of countless lives.<br/><p style="margin-top: 1.25rem; padding: 0.9rem; background: rgba(255,255,255,0.1); border-left: 4px solid rgba(255,255,255,0.5); font-style: italic; font-size: 0.9rem;"><span style="color: #ffd700; font-weight: 800; font-size: 1.25rem;">ॐ</span><br/>"जातस्य हि ध्रुवो मृत्युर्ध्रुवं जन्म मृतस्य च।"<br/>For one who is born, death is certain; for one who dies, rebirth is certain.</p>`, image: '/images/Mahabharata/The_fall_of_warriors.png' },
  { front: "The Coronation of Yudhishthir", back: `After the war, Yudhishthir was crowned King of Hastinapur. Peace returned, yet the weight of loss haunted the Pandavas' hearts.`, image: '/images/Mahabharata/The_coronation_of_Yudhishthir.png' },
  { front: "The End of the Pandavas' Journey", back: `After ruling for years, the Pandavas renounced the throne and journeyed to the Himalayas, seeking liberation. One by one, they fell, until only Yudhishthir reached heaven.`, image: '/images/Mahabharata/End_of_pandavas.png' },
  { front: "Krishna's Departure", back: `In Dwarka, Krishna ended his earthly life, struck by a hunter's arrow. With his departure, the Dvapara Yuga came to a close, and Kali Yuga began.<br/><p style="margin-top: 1.25rem; padding: 0.9rem; background: rgba(255,255,255,0.1); border-left: 4px solid rgba(255,255,255,0.5); font-style: italic; font-size: 0.9rem;"><span style="color: #ffd700; font-weight: 800; font-size: 1.25rem;">ॐ</span><br/>"यदा यदा हि धर्मस्य ग्लानिर्भवति भारत।"<br/>Whenever righteousness declines, I manifest myself to restore balance.</p>`, image: '/images/Mahabharata/Krishna_departure.png' },
  { front: "Legacy of the Mahabharata", back: `The tale of Mahabharata endures as the eternal struggle between dharma and adharma. Its lessons guide humanity — that truth, duty, and righteousness always prevail, even through destruction.<br/><p style="margin-top: 1.25rem; padding: 0.9rem; background: rgba(255,255,255,0.1); border-left: 4px solid rgba(255,255,255,0.5); font-style: italic; font-size: 0.9rem;"><span style="color: #ffd700; font-weight: 800; font-size: 1.25rem;">ॐ</span><br/>"यत्र योगेश्वरः कृष्णो यत्र पार्थो धनुर्धरः।"<br/>Wherever Krishna and Arjuna stand together, there will be victory, prosperity, and righteousness.</p>`, image: '/images/Mahabharata/Legacy_of_Mahabharata.png' }
];

export default function Flashcards({ epic, onBack }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  const cards = epic === 'ramayan' ? ramayanFlashcards : epic === 'harivamsa' ? harivamsaFlashcards : epic === 'mahabharat' ? mahabharataFlashcards : [];

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowLeft') handlePrevious();
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        setIsFlipped(prev => !prev);
      }
      if (e.key === 'Escape') onBack();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, onBack]);

  const handleNext = () => {
    if (currentIndex < cards.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setIsFlipped(false);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setIsFlipped(false);
    }
  };

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  if (cards.length === 0) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <p>No flashcards available for this epic.</p>
        <button onClick={onBack} style={{ marginTop: '20px', padding: '10px 20px', background: 'var(--accent)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
          Back to Details
        </button>
      </div>
    );
  }

  const currentCard = cards[currentIndex];
  
  const epicTitle = epic === 'ramayan' 
    ? 'Ramayan: Journey of Shri Ram' 
    : epic === 'harivamsa' 
    ? "Harivamsa: Krishna's Lineage"
    : epic === 'mahabharat'
    ? 'Mahabharata: The Eternal Song of Dharma'
    : 'Epic Flashcards';

  return (
    <div className="flashcard-content active">
      <div className="flashcard-header" style={{ position: 'relative', padding: '64px 24px 14px', textAlign: 'center', marginBottom: '20px' }}>
        <button 
          onClick={onBack}
          className="panel-toggle-btn"
          style={{
            position: 'absolute',
            top: '15px',
            left: '18px',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 20px',
            borderRadius: '999px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: '#fff',
            border: '2px solid rgba(255,255,255,0.25)',
            fontWeight: '600',
            fontSize: '0.92rem',
            letterSpacing: '.3px',
            cursor: 'pointer',
            boxShadow: '0 6px 18px rgba(118,75,162,0.35)',
            transition: 'transform .18s ease, box-shadow .25s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-3px)';
            e.currentTarget.style.boxShadow = '0 10px 28px rgba(118,75,162,0.45)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 6px 18px rgba(118,75,162,0.35)';
          }}
        >
          <span style={{ fontSize: '1rem', display: 'flex' }}>↩️</span>
          <span>Back to Details</span>
        </button>
        <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.8rem', margin: '0 0 8px', color: '#2c3e50' }}>
          {epicTitle}
        </h2>
        <p style={{ fontSize: '0.9rem', color: '#666', margin: 0 }}>
          Click a card to flip it. Use arrow keys to navigate.
        </p>
      </div>

      <div className="flashcards-grid" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px', padding: '20px 0' }}>
        <div className="flashcard-container" style={{ perspective: '1000px', width: '100%', maxWidth: '500px' }}>
          <div 
            className={`flashcard ${isFlipped ? 'flipped' : ''}`}
            onClick={handleFlip}
            style={{
              position: 'relative',
              width: '100%',
              height: '450px',
              transformStyle: 'preserve-3d',
              transition: 'transform 0.6s',
              cursor: 'pointer',
              borderRadius: '16px',
              boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
              transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)'
            }}
          >
            {/* Front of card */}
            <div 
              className="flashcard-front"
              style={{
                position: 'absolute',
                width: '100%',
                height: '100%',
                backfaceVisibility: 'hidden',
                borderRadius: '16px',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                background: 'white'
              }}
            >
              <div className="image-wrap" style={{ width: '100%', height: '280px', overflow: 'hidden' }}>
                <img 
                  className="flashcard-image"
                  src={`${currentCard.image.startsWith('/') ? currentCard.image : '/' + currentCard.image}`}
                  alt={currentCard.front}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  onError={(e) => {
                    e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect fill="%23ddd" width="400" height="300"/%3E%3Ctext fill="%23999" x="50%25" y="50%25" text-anchor="middle" dominant-baseline="middle" font-family="sans-serif"%3EImage not found%3C/text%3E%3C/svg%3E';
                  }}
                />
              </div>
              <div style={{ padding: '0.75rem 1rem', textAlign: 'center', flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <h3 style={{ margin: 0, fontSize: '1.05rem', color: '#0f172a', fontWeight: '700' }}>
                  {currentCard.front}
                </h3>
              </div>
            </div>

            {/* Back of card */}
            <div 
              className="flashcard-back"
              style={{
                position: 'absolute',
                width: '100%',
                height: '100%',
                backfaceVisibility: 'hidden',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                transform: 'rotateY(180deg)',
                padding: '30px',
                overflowY: 'auto',
                borderRadius: '16px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center'
              }}
            >
              <div 
                className="back-content" 
                dangerouslySetInnerHTML={{ __html: currentCard.back }}
                style={{ lineHeight: '1.6' }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="flashcard-nav" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '20px', marginTop: '20px' }}>
        <button 
          onClick={handlePrevious}
          disabled={currentIndex === 0}
          style={{
            padding: '10px 20px',
            border: 'none',
            background: currentIndex === 0 ? '#ddd' : 'var(--accent)',
            color: currentIndex === 0 ? '#999' : 'white',
            borderRadius: '8px',
            cursor: currentIndex === 0 ? 'not-allowed' : 'pointer',
            fontWeight: '600',
            transition: 'transform 0.2s, background 0.2s',
            opacity: currentIndex === 0 ? 0.3 : 1
          }}
          onMouseEnter={(e) => {
            if (currentIndex !== 0) {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.background = '#2c3e50';
            }
          }}
          onMouseLeave={(e) => {
            if (currentIndex !== 0) {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.background = 'var(--accent)';
            }
          }}
        >
          ← Previous
        </button>
        <span className="flashcard-position" style={{ fontWeight: '600', color: '#2c3e50' }}>
          {currentIndex + 1} / {cards.length}
        </span>
        <button 
          onClick={handleNext}
          disabled={currentIndex === cards.length - 1}
          style={{
            padding: '10px 20px',
            border: 'none',
            background: currentIndex === cards.length - 1 ? '#ddd' : 'var(--accent)',
            color: currentIndex === cards.length - 1 ? '#999' : 'white',
            borderRadius: '8px',
            cursor: currentIndex === cards.length - 1 ? 'not-allowed' : 'pointer',
            fontWeight: '600',
            transition: 'transform 0.2s, background 0.2s',
            opacity: currentIndex === cards.length - 1 ? 0.3 : 1
          }}
          onMouseEnter={(e) => {
            if (currentIndex !== cards.length - 1) {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.background = '#2c3e50';
            }
          }}
          onMouseLeave={(e) => {
            if (currentIndex !== cards.length - 1) {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.background = 'var(--accent)';
            }
          }}
        >
          Next →
        </button>
      </div>
    </div>
  );
}

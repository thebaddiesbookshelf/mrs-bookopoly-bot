const chanceCards = [

  {

    id: 'chance-001',

    title: 'Advance to GO',

    description:

      'Your reading journey takes an unexpected shortcut. Collect 500 Baddie Bucks.',

    effect: {

      type: 'add_balance',

      amount: 500,

    },

  },

  {

    id: 'chance-002',

    title: 'Bank Error in Your Favor',

    description:

      'Mrs. Bookopoly discovers a bookkeeping mistake in your favor. Collect 400 Baddie Bucks.',

    effect: {

      type: 'add_balance',

      amount: 400,

    },

  },

  {

    id: 'chance-003',

    title: 'Go Directly to Literary Lockup',

    description:

      'Do not pass GO. Do not collect Baddie Bucks. Report immediately to Literary Lockup.',

    effect: {

      type: 'go_to_jail',

    },

  },

  {

    id: 'chance-004',

    title: 'Get Out of Jail Free',

    description:

      'Keep this card until you need it. Mrs. Bookopoly grants you one Get Out of Jail Free card.',

    effect: {

      type: 'add_jail_card',

      amount: 1,

    },

  },

  {

    id: 'chance-005',

    title: 'Bestseller Bonus',

    description:

      'Your latest read has become the talk of the shelf. Collect 300 Baddie Bucks.',

    effect: {

      type: 'add_balance',

      amount: 300,

    },

  },

  {

    id: 'chance-006',

    title: 'Overdue Library Fees',

    description:

      'Those books were due three chapters ago. Pay 150 Baddie Bucks.',

    effect: {

      type: 'remove_balance',

      amount: 150,

    },

  },

  {

    id: 'chance-007',

    title: 'Limited Edition Find',

    description:

      'You found a rare edition hidden in the back of the bookstore. Collect 250 Baddie Bucks.',

    effect: {

      type: 'add_balance',

      amount: 250,

    },

  },

  {

    id: 'chance-008',

    title: 'Damaged Dust Jacket',

    description:

      'A collector noticed the damage immediately. Pay 100 Baddie Bucks.',

    effect: {

      type: 'remove_balance',

      amount: 100,

    },

  },

  {

    id: 'chance-009',

    title: 'Reading Sprint Victory',

    description:

      'You flew through the pages and left the competition behind. Collect 350 Baddie Bucks.',

    effect: {

      type: 'add_balance',

      amount: 350,

    },

  },

  {

    id: 'chance-010',

    title: 'Bookstore Shopping Spree',

    description:

      'You said you were only browsing. Pay 300 Baddie Bucks.',

    effect: {

      type: 'remove_balance',

      amount: 300,

    },

  },

  {

    id: 'chance-011',

    title: 'Secret Shelf Investment',

    description:

      'Your hidden literary investment has paid off. Collect 600 Baddie Bucks.',

    effect: {

      type: 'add_balance',

      amount: 600,

    },

  },

  {

    id: 'chance-012',

    title: 'Plot Twist Tax',

    description:

      'That ending cost you emotionally and financially. Pay 200 Baddie Bucks.',

    effect: {

      type: 'remove_balance',

      amount: 200,

    },

  },

  {

    id: 'chance-013',

    title: 'Book Club Favorite',

    description:

      'Your recommendation becomes the official book club pick. Collect 300 Baddie Bucks.',

    effect: {

      type: 'add_balance',

      amount: 300,

    },

  },

  {

    id: 'chance-014',

    title: 'Spoiler Fine',

    description:

      'Mrs. Bookopoly heard what you said about chapter thirty-two. Pay 250 Baddie Bucks.',

    effect: {

      type: 'remove_balance',

      amount: 250,

    },

  },

  {

    id: 'chance-015',

    title: 'Author Signing',

    description:

      'Your signed copy increases in value overnight. Collect 450 Baddie Bucks.',

    effect: {

      type: 'add_balance',

      amount: 450,

    },

  },

  {

    id: 'chance-016',

    title: 'Broken Bookshelf',

    description:

      'Your shelf finally surrendered under the weight of your TBR. Pay 350 Baddie Bucks.',

    effect: {

      type: 'remove_balance',

      amount: 350,

    },

  },

  {

    id: 'chance-017',

    title: 'Lucky Bookmark',

    description:

      'A golden bookmark appears between the pages. Collect 200 Baddie Bucks.',

    effect: {

      type: 'add_balance',

      amount: 200,

    },

  },

  {

    id: 'chance-018',

    title: 'Late-Night Book Order',

    description:

      'Your midnight shopping cart has been processed. Pay 175 Baddie Bucks.',

    effect: {

      type: 'remove_balance',

      amount: 175,

    },

  },

  {

    id: 'chance-019',

    title: 'Five-Star Review',

    description:

      'Your review sends readers rushing to the shelves. Collect 275 Baddie Bucks.',

    effect: {

      type: 'add_balance',

      amount: 275,

    },

  },

  {

    id: 'chance-020',

    title: 'DNF Recovery Fee',

    description:

      'That book wasted your time and now it wants your money too. Pay 125 Baddie Bucks.',

    effect: {

      type: 'remove_balance',

      amount: 125,

    },

  },

  {

    id: 'chance-021',

    title: 'Hidden Chapter Discovered',

    description:

      'You uncovered a secret chapter no one else has read. Collect 500 Baddie Bucks.',

    effect: {

      type: 'add_balance',

      amount: 500,

    },

  },

  {

    id: 'chance-022',

    title: 'Reading Slump',

    description:

      'Your motivation has disappeared somewhere under the TBR pile. Pay 100 Baddie Bucks.',

    effect: {

      type: 'remove_balance',

      amount: 100,

    },

  },

  {

    id: 'chance-023',

    title: 'Adaptation Rights Sold',

    description:

      'Your favorite book is heading to the big screen. Collect 700 Baddie Bucks.',

    effect: {

      type: 'add_balance',

      amount: 700,

    },

  },

  {

    id: 'chance-024',

    title: 'Terrible Adaptation',

    description:

      'They changed the ending and removed your favorite character. Pay 225 Baddie Bucks.',

    effect: {

      type: 'remove_balance',

      amount: 225,

    },

  },

  {

    id: 'chance-025',

    title: 'First Edition Auction',

    description:

      'Your rare first edition sells for a beautiful profit. Collect 800 Baddie Bucks.',

    effect: {

      type: 'add_balance',

      amount: 800,

    },

  },

  {

    id: 'chance-026',

    title: 'Collector’s Insurance',

    description:

      'Protecting your prized collection is not cheap. Pay 400 Baddie Bucks.',

    effect: {

      type: 'remove_balance',

      amount: 400,

    },

  },

  {

    id: 'chance-027',

    title: 'Page-Turning Profit',

    description:

      'Your latest investment is paying dividends one chapter at a time. Collect 325 Baddie Bucks.',

    effect: {

      type: 'add_balance',

      amount: 325,

    },

  },

  {

    id: 'chance-028',

    title: 'Coffee Spill',

    description:

      'Your drink landed directly on the most expensive book you own. Pay 275 Baddie Bucks.',

    effect: {

      type: 'remove_balance',

      amount: 275,

    },

  },

  {

    id: 'chance-029',

    title: 'Mystery Box Win',

    description:

      'Your mystery book box contains a valuable surprise. Collect 350 Baddie Bucks.',

    effect: {

      type: 'add_balance',

      amount: 350,

    },

  },

  {

    id: 'chance-030',

    title: 'Mystery Box Disaster',

    description:

      'Your mystery box contains three books you already own. Pay 150 Baddie Bucks.',

    effect: {

      type: 'remove_balance',

      amount: 150,

    },

  },

  {

    id: 'chance-031',

    title: 'Viral Book Post',

    description:

      'Your shelf photo has gone viral. Collect 550 Baddie Bucks.',

    effect: {

      type: 'add_balance',

      amount: 550,

    },

  },

  {

    id: 'chance-032',

    title: 'Unplanned Special Edition',

    description:

      'A sprayed-edge edition has appeared, and resistance was impossible. Pay 325 Baddie Bucks.',

    effect: {

      type: 'remove_balance',

      amount: 325,

    },

  },

  {

    id: 'chance-033',

    title: 'Reading Challenge Champion',

    description:

      'You finished the challenge before anyone expected. Collect 650 Baddie Bucks.',

    effect: {

      type: 'add_balance',

      amount: 650,

    },

  },

  {

    id: 'chance-034',

    title: 'Lost Library Card',

    description:

      'Replacement fees have been added to your account. Pay 75 Baddie Bucks.',

    effect: {

      type: 'remove_balance',

      amount: 75,

    },

  },

  {

    id: 'chance-035',

    title: 'Unexpected Royalty Check',

    description:

      'A surprise payment has arrived from Mrs. Bookopoly’s publishing house. Collect 475 Baddie Bucks.',

    effect: {

      type: 'add_balance',

      amount: 475,

    },

  },

  {

    id: 'chance-036',

    title: 'Misprinted Collector’s Copy',

    description:

      'The supposedly rare edition was printed upside down. Pay 200 Baddie Bucks.',

    effect: {

      type: 'remove_balance',

      amount: 200,

    },

  },

  {

    id: 'chance-037',

    title: 'TBR Lottery',

    description:

      'Your randomly selected book is exactly what you needed. Collect 225 Baddie Bucks.',

    effect: {

      type: 'add_balance',

      amount: 225,

    },

  },

  {

    id: 'chance-038',

    title: 'Book Ban Appeal Fee',

    description:

      'Mrs. Bookopoly requires a filing fee before reviewing your case. Pay 180 Baddie Bucks.',

    effect: {

      type: 'remove_balance',

      amount: 180,

    },

  },

  {

    id: 'chance-039',

    title: 'Golden Shelf Award',

    description:

      'Your collection has been named the finest on the block. Collect 900 Baddie Bucks.',

    effect: {

      type: 'add_balance',

      amount: 800,

    },

  },

  {

    id: 'chance-040',

    title: 'Shelf Inspection',

    description:

      'Mrs. Bookopoly found several books arranged out of order. Pay 120 Baddie Bucks.',

    effect: {

      type: 'remove_balance',

      amount: 120,

    },

  },

  {

    id: 'chance-041',

    title: 'Publisher’s Advance',

    description:

      'Your next great story has been approved in advance. Collect 750 Baddie Bucks.',

    effect: {

      type: 'add_balance',

      amount: 750,

    },

  },

  {

    id: 'chance-042',

    title: 'Cancelled Preorder Fee',

    description:

      'That cancellation was not as free as you hoped. Pay 160 Baddie Bucks.',

    effect: {

      type: 'remove_balance',

      amount: 160,

    },

  },

  {

    id: 'chance-043',

    title: 'Bookish Business Deal',

    description:

      'You negotiated a profitable deal across the board. Collect 425 Baddie Bucks.',

    effect: {

      type: 'add_balance',

      amount: 425,

    },

  },

  {

    id: 'chance-044',

    title: 'Reading Room Renovation',

    description:

      'The velvet chairs were worth it, but they were not cheap. Pay 500 Baddie Bucks.',

    effect: {

      type: 'remove_balance',

      amount: 500,

    },

  },

  {

    id: 'chance-045',

    title: 'Fortune Favors the Well-Read',

    description:

      'Mrs. Bookopoly rewards your excellent literary instincts. Collect 1,000 Baddie Bucks.',

    effect: {

      type: 'add_balance',

      amount: 800,

    },

  },

  {

    id: 'chance-046',

    title: 'Luxury Book Cart',

    description:

      'Gold wheels were unnecessary, but here we are. Pay 450 Baddie Bucks.',

    effect: {

      type: 'remove_balance',

      amount: 450,

    },

  },

  {

    id: 'chance-047',

    title: 'Paperback Profit',

    description:

      'A small investment becomes a surprisingly successful return. Collect 150 Baddie Bucks.',

    effect: {

      type: 'add_balance',

      amount: 150,

    },

  },

  {

    id: 'chance-048',

    title: 'Bent Spine Penalty',

    description:

      'Mrs. Bookopoly has seen the damage and she is not impressed. Pay 90 Baddie Bucks.',

    effect: {

      type: 'remove_balance',

      amount: 90,

    },

  },

  {

    id: 'chance-049',

    title: 'Literary Inheritance',

    description:

      'A mysterious relative leaves you a grand personal library. Collect 850 Baddie Bucks.',

    effect: {

      type: 'add_balance',

      amount: 800,

    },

  },

  {

    id: 'chance-050',

    title: 'Caught Dog-Earing Pages',

    description:

      'This offense cannot go unanswered. Report immediately to Literary Lockup.',

    effect: {

      type: 'go_to_jail',

    },

  },

 

  {

    id: 'chance-051',

    title: 'Midnight Release Jackpot',

    description:

      'You were first in line and found a prize tucked inside your copy. Collect 650 Baddie Bucks.',

    effect: {

      type: 'add_balance',

      amount: 650,

    },

  },

  {

    id: 'chance-052',

    title: 'Perfect Reading Weather',

    description:

      'Rain outside, snacks nearby, and nowhere else to be. Collect 275 Baddie Bucks.',

    effect: {

      type: 'add_balance',

      amount: 275,

    },

  },

  {

    id: 'chance-053',

    title: 'Signed Copy Surprise',

    description:

      'The used book you ordered arrived signed by the author. Collect 500 Baddie Bucks.',

    effect: {

      type: 'add_balance',

      amount: 500,

    },

  },

  {

    id: 'chance-054',

    title: 'Readathon Power Hour',

    description:

      'You cleared more pages than anyone expected. Collect 350 Baddie Bucks.',

    effect: {

      type: 'add_balance',

      amount: 350,

    },

  },

  {

    id: 'chance-055',

    title: 'Wishlist Price Drop',

    description:

      'Every book on your wishlist went on sale at once. Collect 225 Baddie Bucks.',

    effect: {

      type: 'add_balance',

      amount: 225,

    },

  },

  {

    id: 'chance-056',

    title: 'Collector Shelf Spotlight',

    description:

      'Your shelves are featured in a bookish magazine. Collect 700 Baddie Bucks.',

    effect: {

      type: 'add_balance',

      amount: 700,

    },

  },

  {

    id: 'chance-057',

    title: 'Lucky Blind Date With a Book',

    description:

      'The mystery pick becomes an instant favorite. Collect 300 Baddie Bucks.',

    effect: {

      type: 'add_balance',

      amount: 300,

    },

  },

  {

    id: 'chance-058',

    title: 'Bookish Side Hustle',

    description:

      'Your custom bookmarks sell out before lunch. Collect 450 Baddie Bucks.',

    effect: {

      type: 'add_balance',

      amount: 450,

    },

  },

  {

    id: 'chance-059',

    title: 'Surprise Store Credit',

    description:

      'An old return finally earns you store credit. Collect 180 Baddie Bucks.',

    effect: {

      type: 'add_balance',

      amount: 180,

    },

  },

  {

    id: 'chance-060',

    title: 'Reading Retreat Upgrade',

    description:

      'Your standard room becomes a luxury reading suite. Collect 800 Baddie Bucks.',

    effect: {

      type: 'add_balance',

      amount: 800,

    },

  },

  {

    id: 'chance-061',

    title: 'Duplicate Edition Disaster',

    description:

      'You accidentally bought the same special edition twice. Pay 200 Baddie Bucks.',

    effect: {

      type: 'remove_balance',

      amount: 200,

    },

  },

  {

    id: 'chance-062',

    title: 'Courier Lost the Book Box',

    description:

      'The replacement shipment comes with an unfortunate fee. Pay 325 Baddie Bucks.',

    effect: {

      type: 'remove_balance',

      amount: 325,

    },

  },

  {

    id: 'chance-063',

    title: 'Deluxe Edition Regret',

    description:

      'The bonus chapter was three pages long. Pay 500 Baddie Bucks.',

    effect: {

      type: 'remove_balance',

      amount: 500,

    },

  },

  {

    id: 'chance-064',

    title: 'Plot Crime',

    description:

      'Mrs. Bookopoly has reviewed that ending. Report immediately to Literary Lockup.',

    effect: {

      type: 'go_to_jail',

    },

  },

  {

    id: 'chance-065',

    title: 'Illegal Cliffhanger',

    description:

      'Ending the book there was a criminal offense. Go directly to Literary Lockup.',

    effect: {

      type: 'go_to_jail',

    },

  },

  {

    id: 'chance-066',

    title: 'Unlicensed Spoiler Distribution',

    description:

      'You revealed the twist without warning. Report immediately to Literary Lockup.',

    effect: {

      type: 'go_to_jail',

    },

  },

  {

    id: 'chance-067',

    title: 'Bookstore After-Hours Incident',

    description:

      'The doors were locked for a reason. Go directly to Literary Lockup.',

    effect: {

      type: 'go_to_jail',

    },

  },

  {

    id: 'chance-068',

    title: 'Suspicious Bookmark Activity',

    description:

      'Mrs. Bookopoly has questions. Report immediately to Literary Lockup.',

    effect: {

      type: 'go_to_jail',

    },

  },

  {

    id: 'chance-069',

    title: 'Crimes Against Book Spines',

    description:

      'That cracked spine was witnessed by three readers. Go directly to Literary Lockup.',

    effect: {

      type: 'go_to_jail',

    },

  },

  {

    id: 'chance-070',

    title: 'Emergency Library Pardon',

    description:

      'Keep this card until you need it. Receive one Get Out of Jail Free card.',

    effect: {

      type: 'add_jail_card',

      amount: 1,

    },

  },

  {

    id: 'chance-071',

    title: 'Author Alibi',

    description:

      'A bestselling author confirms your whereabouts. Receive one Get Out of Jail Free card.',

    effect: {

      type: 'add_jail_card',

      amount: 1,

    },

  },

  {

    id: 'chance-072',

    title: 'Golden Bookmark Pardon',

    description:

      'Mrs. Bookopoly honors the golden bookmark. Receive one Get Out of Jail Free card.',

    effect: {

      type: 'add_jail_card',

      amount: 1,

    },

  },

  {

    id: 'chance-073',

    title: 'Literary Legal Aid',

    description:

      'The readers association takes your case. Receive one Get Out of Jail Free card.',

    effect: {

      type: 'add_jail_card',

      amount: 1,

    },

  },

  {

    id: 'chance-074',

    title: 'Plot Armor',

    description:

      'The story simply refuses to let you stay locked up. Receive one Get Out of Jail Free card.',

    effect: {

      type: 'add_jail_card',

      amount: 1,

    },

  },

  {

    id: 'chance-075',

    title: 'Publisher Pardon',

    description:

      'A powerful publishing contact clears your record. Receive one Get Out of Jail Free card.',

    effect: {

      type: 'add_jail_card',

      amount: 1,

    },

  },

  {

    id: 'chance-076',

    title: 'False Alarm',

    description:

      'Mrs. Bookopoly checks the report, sighs, and closes the file. Nothing happens.',

    effect: {

      type: 'none',

    },

  },

  {

    id: 'chance-077',

    title: 'A Very Suspicious Pause',

    description:

      'Everyone waits for the consequence. It never comes. Nothing happens.',

    effect: {

      type: 'none',

    },

  },

  {

    id: 'chance-078',

    title: 'Mrs. Bookopoly Shrugs',

    description:

      'She looks at the paperwork and decides it can wait. Nothing happens.',

    effect: {

      type: 'none',

    },

  },

  {

    id: 'chance-079',

    title: 'Plot Without a Twist',

    description:

      'For once, the chapter ends exactly as expected. Nothing happens.',

    effect: {

      type: 'none',

    },

  },

  {

    id: 'chance-080',

    title: 'Carry On, Reader',

    description:

      'You are waved through without reward or punishment. Nothing happens.',

    effect: {

      type: 'none',

    },

  },

];

 

const communityChestCards = [

  {

    id: 'community-001',

    title: 'Community Reading Fund',

    description:

      'The neighborhood rewards your dedication to reading. Collect 300 Baddie Bucks.',

    effect: {

      type: 'add_balance',

      amount: 300,

    },

  },

  {

    id: 'community-002',

    title: 'Library Donation Match',

    description:

      'The neighborhood matched your generous book donation. Collect 200 Baddie Bucks.',

    effect: {

      type: 'add_balance',

      amount: 200,

    },

  },

  {

    id: 'community-003',

    title: 'Get Out of Jail Free',

    description:

      'The reading community has vouched for you. Receive one Get Out of Jail Free card.',

    effect: {

      type: 'add_jail_card',

      amount: 1,

    },

  },

  {

    id: 'community-004',

    title: 'Neighborhood Book Sale',

    description:

      'Your used books sell faster than expected. Collect 250 Baddie Bucks.',

    effect: {

      type: 'add_balance',

      amount: 250,

    },

  },

  {

    id: 'community-005',

    title: 'Book Club Rebate',

    description:

      'The club finished under budget and returned your share. Collect 175 Baddie Bucks.',

    effect: {

      type: 'add_balance',

      amount: 175,

    },

  },

  {

    id: 'community-006',

    title: 'Reader Appreciation Award',

    description:

      'Your community recognizes your dedication to the shelf. Collect 400 Baddie Bucks.',

    effect: {

      type: 'add_balance',

      amount: 400,

    },

  },

  {

    id: 'community-007',

    title: 'Little Free Library Grant',

    description:

      'A neighborhood grant covers the repairs and rewards your help. Collect 250 Baddie Bucks.',

    effect: {

      type: 'add_balance',

      amount: 250,

    },

  },

  {

    id: 'community-008',

    title: 'Birthday Book Money',

    description:

      'Your friends know exactly what you wanted. Collect 500 Baddie Bucks.',

    effect: {

      type: 'add_balance',

      amount: 500,

    },

  },

  {

    id: 'community-009',

    title: 'Reading Glasses Replacement',

    description:

      'Your favorite pair vanished between the couch cushions. Pay 175 Baddie Bucks.',

    effect: {

      type: 'remove_balance',

      amount: 175,

    },

  },

  {

    id: 'community-010',

    title: 'Book Fair Volunteer',

    description:

      'Your hard work earns a generous community reward. Collect 275 Baddie Bucks.',

    effect: {

      type: 'add_balance',

      amount: 275,

    },

  },

  {

    id: 'community-011',

    title: 'Community Center Fees',

    description:

      'The reading room needs new tables and chairs. Pay 200 Baddie Bucks.',

    effect: {

      type: 'remove_balance',

      amount: 200,

    },

  },

  {

    id: 'community-012',

    title: 'Local Author Spotlight',

    description:

      'Your support of local authors earns you a bonus. Collect 350 Baddie Bucks.',

    effect: {

      type: 'add_balance',

      amount: 350,

    },

  },

  {

    id: 'community-013',

    title: 'Neighborhood Fine',

    description:

      'Your towering TBR has blocked the sidewalk again. Pay 80 Baddie Bucks.',

    effect: {

      type: 'remove_balance',

      amount: 80,

    },

  },

  {

    id: 'community-014',

    title: 'Book Drive Success',

    description:

      'The community book drive exceeds every goal. Collect 450 Baddie Bucks.',

    effect: {

      type: 'add_balance',

      amount: 450,

    },

  },

  {

    id: 'community-015',

    title: 'Community Newsletter Feature',

    description:

      'Your reading achievements made the front page. Collect 225 Baddie Bucks.',

    effect: {

      type: 'add_balance',

      amount: 225,

    },

  },

  {

    id: 'community-016',

    title: 'Quiet Hours Violation',

    description:

      'Your dramatic reaction to the ending disturbed the entire block. Pay 110 Baddie Bucks.',

    effect: {

      type: 'remove_balance',

      amount: 110,

    },

  },

  {

    id: 'community-017',

    title: 'Shared Shelf Surprise',

    description:

      'Someone leaves the perfect book waiting for you. Collect 200 Baddie Bucks.',

    effect: {

      type: 'add_balance',

      amount: 200,

    },

  },

  {

    id: 'community-018',

    title: 'Book Exchange Shipping',

    description:

      'The package was heavier than expected. Pay 140 Baddie Bucks.',

    effect: {

      type: 'remove_balance',

      amount: 140,

    },

  },

  {

    id: 'community-019',

    title: 'Reading Mentor Bonus',

    description:

      'Helping another reader pays off. Collect 325 Baddie Bucks.',

    effect: {

      type: 'add_balance',

      amount: 325,

    },

  },

  {

    id: 'community-020',

    title: 'Community Shelf Cleanup',

    description:

      'Everyone avoided the work, so the bill landed on you. Pay 130 Baddie Bucks.',

    effect: {

      type: 'remove_balance',

      amount: 130,

    },

  },

  {

    id: 'community-021',

    title: 'Neighborhood Reading Grant',

    description:

      'Your reading plans receive full funding. Collect 600 Baddie Bucks.',

    effect: {

      type: 'add_balance',

      amount: 600,

    },

  },

  {

    id: 'community-022',

    title: 'Lost Book Replacement',

    description:

      'The missing book has officially been declared gone. Pay 250 Baddie Bucks.',

    effect: {

      type: 'remove_balance',

      amount: 250,

    },

  },

  {

    id: 'community-023',

    title: 'Community Trivia Winner',

    description:

      'Your book knowledge leaves everyone speechless. Collect 375 Baddie Bucks.',

    effect: {

      type: 'add_balance',

      amount: 375,

    },

  },

  {

    id: 'community-024',

    title: 'Reading Event Snacks',

    description:

      'Someone had to provide the cookies. Pay 120 Baddie Bucks.',

    effect: {

      type: 'remove_balance',

      amount: 120,

    },

  },

  {

    id: 'community-025',

    title: 'Neighborhood Bestseller',

    description:

      'Everyone on the block is reading your recommendation. Collect 550 Baddie Bucks.',

    effect: {

      type: 'add_balance',

      amount: 550,

    },

  },

  {

    id: 'community-026',

    title: 'Community Room Reservation',

    description:

      'The premium reading lounge requires a deposit. Pay 225 Baddie Bucks.',

    effect: {

      type: 'remove_balance',

      amount: 225,

    },

  },

  {

    id: 'community-027',

    title: 'Book Swap Treasure',

    description:

      'You traded one paperback and received a rare hardcover. Collect 425 Baddie Bucks.',

    effect: {

      type: 'add_balance',

      amount: 425,

    },

  },

  {

    id: 'community-028',

    title: 'Damaged Community Copy',

    description:

      'The coffee stain has your name written all over it. Pay 180 Baddie Bucks.',

    effect: {

      type: 'remove_balance',

      amount: 180,

    },

  },

  {

    id: 'community-029',

    title: 'Reading Streak Reward',

    description:

      'Your consistency earns recognition from the entire community. Collect 475 Baddie Bucks.',

    effect: {

      type: 'add_balance',

      amount: 475,

    },

  },

  {

    id: 'community-030',

    title: 'Neighborhood Association Dues',

    description:

      'The annual literary district fees are due. Pay 160 Baddie Bucks.',

    effect: {

      type: 'remove_balance',

      amount: 160,

    },

  },

  {

    id: 'community-031',

    title: 'Storytime Host',

    description:

      'Your dramatic reading receives a standing ovation. Collect 300 Baddie Bucks.',

    effect: {

      type: 'add_balance',

      amount: 300,

    },

  },

  {

    id: 'community-032',

    title: 'Microphone Replacement',

    description:

      'Your dramatic reading was a little too dramatic. Pay 210 Baddie Bucks.',

    effect: {

      type: 'remove_balance',

      amount: 210,

    },

  },

  {

    id: 'community-033',

    title: 'Community Choice Award',

    description:

      'Readers vote your selection the best book of the month. Collect 700 Baddie Bucks.',

    effect: {

      type: 'add_balance',

      amount: 700,

    },

  },

  {

    id: 'community-034',

    title: 'Book Club Catering',

    description:

      'The discussion was free. The food was not. Pay 275 Baddie Bucks.',

    effect: {

      type: 'remove_balance',

      amount: 275,

    },

  },

  {

    id: 'community-035',

    title: 'Little Free Library Jackpot',

    description:

      'A generous neighbor leaves behind an entire unread series. Collect 500 Baddie Bucks.',

    effect: {

      type: 'add_balance',

      amount: 500,

    },

  },

  {

    id: 'community-036',

    title: 'Community Garden Reading Nook',

    description:

      'Your contribution helps build a beautiful outdoor reading space. Pay 300 Baddie Bucks.',

    effect: {

      type: 'remove_balance',

      amount: 300,

    },

  },

  {

    id: 'community-037',

    title: 'Bookish Scholarship',

    description:

      'Your excellent reading record earns a scholarship. Collect 800 Baddie Bucks.',

    effect: {

      type: 'add_balance',

      amount: 800,

    },

  },

  {

    id: 'community-038',

    title: 'Neighborhood Noise Complaint',

    description:

      'Your audiobook was playing much louder than you realized. Pay 95 Baddie Bucks.',

    effect: {

      type: 'remove_balance',

      amount: 95,

    },

  },

  {

    id: 'community-039',

    title: 'Library Volunteer of the Month',

    description:

      'Your name is displayed proudly at the front desk. Collect 350 Baddie Bucks.',

    effect: {

      type: 'add_balance',

      amount: 350,

    },

  },

  {

    id: 'community-040',

    title: 'Community Printer Jam',

    description:

      'You printed one bookmark and somehow broke the entire machine. Pay 190 Baddie Bucks.',

    effect: {

      type: 'remove_balance',

      amount: 190,

    },

  },

  {

    id: 'community-041',

    title: 'Neighborhood Reading Festival',

    description:

      'Your booth becomes the most popular stop at the festival. Collect 650 Baddie Bucks.',

    effect: {

      type: 'add_balance',

      amount: 650,

    },

  },

  {

    id: 'community-042',

    title: 'Festival Booth Fee',

    description:

      'Prime placement near the book tents comes at a price. Pay 240 Baddie Bucks.',

    effect: {

      type: 'remove_balance',

      amount: 240,

    },

  },

  {

    id: 'community-043',

    title: 'Community Reading Goal Reached',

    description:

      'The entire neighborhood celebrates the shared milestone. Collect 575 Baddie Bucks.',

    effect: {

      type: 'add_balance',

      amount: 575,

    },

  },

  {

    id: 'community-044',

    title: 'Book Cart Maintenance',

    description:

      'One wheel has been squeaking for weeks. Pay 135 Baddie Bucks.',

    effect: {

      type: 'remove_balance',

      amount: 135,

    },

  },

  {

    id: 'community-045',

    title: 'Reader Referral Bonus',

    description:

      'A new reader joins the community because of you. Collect 275 Baddie Bucks.',

    effect: {

      type: 'add_balance',

      amount: 275,

    },

  },

  {

    id: 'community-046',

    title: 'Community Book Fund Contribution',

    description:

      'Every reader contributes to keep the shelves stocked. Pay 150 Baddie Bucks.',

    effect: {

      type: 'remove_balance',

      amount: 150,

    },

  },

  {

    id: 'community-047',

    title: 'Grand Library Opening',

    description:

      'You receive a special reward for attending opening day. Collect 900 Baddie Bucks.',

    effect: {

      type: 'add_balance',

      amount: 800,

    },

  },

  {

    id: 'community-048',

    title: 'Reading Lounge Cleaning Fee',

    description:

      'There are crumbs between every cushion. Pay 115 Baddie Bucks.',

    effect: {

      type: 'remove_balance',

      amount: 115,

    },

  },

  {

    id: 'community-049',

    title: 'Community Appreciation Gift',

    description:

      'A beautifully wrapped gift arrives from your fellow readers. Collect 225 Baddie Bucks.',

    effect: {

      type: 'add_balance',

      amount: 225,

    },

  },

  {

    id: 'community-050',

    title: 'Unauthorized Midnight Reading',

    description:

      'You were caught roaming the library after closing. Report immediately to Literary Lockup.',

    effect: {

      type: 'go_to_jail',

    },

  },

 

  {

    id: 'community-051',

    title: 'Neighborhood Reading Picnic',

    description:

      'Your table wins best setup at the community picnic. Collect 300 Baddie Bucks.',

    effect: {

      type: 'add_balance',

      amount: 300,

    },

  },

  {

    id: 'community-052',

    title: 'Community Bookmark Sale',

    description:

      'Your handmade bookmarks sell out. Collect 250 Baddie Bucks.',

    effect: {

      type: 'add_balance',

      amount: 250,

    },

  },

  {

    id: 'community-053',

    title: 'Library Friends Bonus',

    description:

      'The Friends of the Library recognize your support. Collect 425 Baddie Bucks.',

    effect: {

      type: 'add_balance',

      amount: 425,

    },

  },

  {

    id: 'community-054',

    title: 'Neighborhood Readalong Prize',

    description:

      'Your name is drawn from the community readalong raffle. Collect 500 Baddie Bucks.',

    effect: {

      type: 'add_balance',

      amount: 500,

    },

  },

  {

    id: 'community-055',

    title: 'Local Bookshop Loyalty Reward',

    description:

      'Your loyalty points finally pay off. Collect 200 Baddie Bucks.',

    effect: {

      type: 'add_balance',

      amount: 200,

    },

  },

  {

    id: 'community-056',

    title: 'Community Story Contest',

    description:

      'Your entry wins the neighborhood vote. Collect 650 Baddie Bucks.',

    effect: {

      type: 'add_balance',

      amount: 650,

    },

  },

  {

    id: 'community-057',

    title: 'Reading Buddy Appreciation',

    description:

      'Your reading buddy sends a thank-you gift. Collect 175 Baddie Bucks.',

    effect: {

      type: 'add_balance',

      amount: 175,

    },

  },

  {

    id: 'community-058',

    title: 'Book Drive Sponsorship',

    description:

      'A local sponsor rewards your work. Collect 550 Baddie Bucks.',

    effect: {

      type: 'add_balance',

      amount: 550,

    },

  },

  {

    id: 'community-059',

    title: 'Community Reading Champion',

    description:

      'The neighborhood crowns you its reading champion. Collect 800 Baddie Bucks.',

    effect: {

      type: 'add_balance',

      amount: 800,

    },

  },

  {

    id: 'community-060',

    title: 'Shared Shelf Thank-You',

    description:

      'Your thoughtful recommendation earns a small community reward. Collect 225 Baddie Bucks.',

    effect: {

      type: 'add_balance',

      amount: 225,

    },

  },

  {

    id: 'community-061',

    title: 'Library Mural Fundraiser',

    description:

      'The fundraiser exceeds its goal and returns the surplus. Collect 375 Baddie Bucks.',

    effect: {

      type: 'add_balance',

      amount: 375,

    },

  },

  {

    id: 'community-062',

    title: 'Neighborhood Book Basket',

    description:

      'A surprise basket arrives at your door. Collect 275 Baddie Bucks.',

    effect: {

      type: 'add_balance',

      amount: 275,

    },

  },

  {

    id: 'community-063',

    title: 'Community Advocate Pardon',

    description:

      'A trusted neighbor speaks on your behalf. Receive one Get Out of Jail Free card.',

    effect: {

      type: 'add_jail_card',

      amount: 1,

    },

  },

  {

    id: 'community-064',

    title: 'Library Board Pardon',

    description:

      'The library board approves your immediate release. Receive one Get Out of Jail Free card.',

    effect: {

      type: 'add_jail_card',

      amount: 1,

    },

  },

  {

    id: 'community-065',

    title: 'Book Club Alibi',

    description:

      'Your entire book club confirms you were at the meeting. Receive one Get Out of Jail Free card.',

    effect: {

      type: 'add_jail_card',

      amount: 1,

    },

  },

  {

    id: 'community-066',

    title: 'Neighborhood Clemency',

    description:

      'The community signs a petition for your release. Receive one Get Out of Jail Free card.',

    effect: {

      type: 'add_jail_card',

      amount: 1,

    },

  },

  {

    id: 'community-067',

    title: 'Volunteer Service Credit',

    description:

      'Your volunteer hours clear the charge. Receive one Get Out of Jail Free card.',

    effect: {

      type: 'add_jail_card',

      amount: 1,

    },

  },

  {

    id: 'community-068',

    title: 'Reading Mentor Pardon',

    description:

      'Your service as a reading mentor earns leniency. Receive one Get Out of Jail Free card.',

    effect: {

      type: 'add_jail_card',

      amount: 1,

    },

  },

  {

    id: 'community-069',

    title: 'Little Free Library Alibi',

    description:

      'Three neighbors saw you restocking the shelves. Receive one Get Out of Jail Free card.',

    effect: {

      type: 'add_jail_card',

      amount: 1,

    },

  },

  {

    id: 'community-070',

    title: 'Community Service Award',

    description:

      'Your award comes with one official pardon. Receive one Get Out of Jail Free card.',

    effect: {

      type: 'add_jail_card',

      amount: 1,

    },

  },

  {

    id: 'community-071',

    title: 'Reader Protection Program',

    description:

      'The community places you under reader protection. Receive one Get Out of Jail Free card.',

    effect: {

      type: 'add_jail_card',

      amount: 1,

    },

  },

  {

    id: 'community-072',

    title: 'Disturbing the Book Club',

    description:

      'The debate got completely out of hand. Report immediately to Literary Lockup.',

    effect: {

      type: 'go_to_jail',

    },

  },

  {

    id: 'community-073',

    title: 'Unauthorized Library Takeover',

    description:

      'You cannot reserve every reading room at once. Go directly to Literary Lockup.',

    effect: {

      type: 'go_to_jail',

    },

  },

  {

    id: 'community-074',

    title: 'Neighborhood Spoiler Scandal',

    description:

      'The entire block heard the ending from you. Report immediately to Literary Lockup.',

    effect: {

      type: 'go_to_jail',

    },

  },

  {

    id: 'community-075',

    title: 'Community Copy Misconduct',

    description:

      'The shared book returned covered in notes and crumbs. Go directly to Literary Lockup.',

    effect: {

      type: 'go_to_jail',

    },

  },

  {

    id: 'community-076',

    title: 'Nothing to Report',

    description:

      'The neighborhood meeting ends early. Nothing happens.',

    effect: {

      type: 'none',

    },

  },

  {

    id: 'community-077',

    title: 'Quiet Day on the Block',

    description:

      'No fines, no prizes, and no drama. Nothing happens.',

    effect: {

      type: 'none',

    },

  },

  {

    id: 'community-078',

    title: 'Community Bulletin Empty',

    description:

      'There are no announcements with your name on them. Nothing happens.',

    effect: {

      type: 'none',

    },

  },

  {

    id: 'community-079',

    title: 'The Neighbors Mind Their Business',

    description:

      'A rare and beautiful moment of peace. Nothing happens.',

    effect: {

      type: 'none',

    },

  },

  {

    id: 'community-080',

    title: 'Routine Check-In',

    description:

      'Everything is normal, which is almost suspicious. Nothing happens.',

    effect: {

      type: 'none',

    },

  },

];

 

function getRandomCard(deck) {

  if (!Array.isArray(deck) || deck.length === 0) {

    throw new Error('A valid card deck is required.');

  }

 

  return deck[Math.floor(Math.random() * deck.length)];

}

 

module.exports = {

  chanceCards,

  communityChestCards,

  getRandomCard,

};
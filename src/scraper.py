
import json
from util.constants import PLAYER_STATS_URL, CATEGORIES, SAVE_LOCATION
from util.scraper import Scraper


if __name__ == '__main__':
    categories = CATEGORIES
    url = PLAYER_STATS_URL
    scraper = Scraper(url)
    players_stats = {}

    for category in categories:
        category_stats = scraper.scrape_all_pages(category)
        for key in category_stats:
            if key in players_stats:
                players_stats[key]['stats'].update(category_stats[key]['stats'])
            else:
                players_stats[key] = category_stats[key]

    with open(SAVE_LOCATION, 'w') as f:
        json.dump(list(players_stats.values()), f, indent=4)

    print("Data scraped and saved to player_stats.json")

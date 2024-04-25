import requests
from bs4 import BeautifulSoup
from util.constants import HEADERS

class Scraper:
    def __init__(self, base_url):
        self.base_url = base_url

    def get_page_content(self, page_number, category):
        url = f"{self.base_url}?pageNumber={page_number}&category={category}"
        headers = HEADERS
        response = requests.get(url, headers=headers)
        return response.text

    def parse_stats(self, html_content):
        soup = BeautifulSoup(html_content, 'html.parser')
        players = {}
        table = soup.find('table', {'class': 'fiso-lab-table'})
        if not table:
            return players
        rows = table.find('tbody').find_all('tr')
        for row in rows:
            cols = row.find_all('td')
            header = row.find('th', {'class': 'fiso-lab-table__row-heading'})
            name = header.find('span', {'class': 'fiso-lab-table__row-heading-primary-data'}).get('title', '').strip()
            team = header.find('span', {'class': 'fiso-lab-table__row-heading-secondary-data'}).get_text(strip=True)
            key = f"{name} - {team}"
            if key not in players:
                players[key] = {'name': name, 'team': team, 'stats': {}}
            headers = [th.get_text(strip=True) for th in table.find('thead').find_all('th')]
            for h, col in zip(headers[1:], cols):
                stat_key = h
                players[key]['stats'][stat_key] = col.get_text(strip=True)
        return players

    def scrape_all_pages(self, category):
        all_players = {}
        page_number = 1
        while True:
            print(f"Scraping category {category}, page {page_number}")
            content = self.get_page_content(page_number, category)
            players = self.parse_stats(content)
            if not players:
                break
            for key in players:
                if key in all_players:
                    all_players[key]['stats'].update(players[key]['stats'])
                else:
                    all_players[key] = players[key]
            soup = BeautifulSoup(content, 'html.parser')
            next_button = soup.find('button', {'aria-label': 'Show Next Page'})
            if 'disabled' in next_button.get('class', ''):
                break
            page_number += 1
        return all_players
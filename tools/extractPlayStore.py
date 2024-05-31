#!/usr/bin/env python
# -*- coding: utf-8 -*-
from subprocess import check_output, call
import pyodbc
import os
import io
from datetime import datetime, timedelta

# Taktik:
#  - Find seneste dato i SQL, fx 2018-08-27
#  - Tag måneden fra datoen: 2018-08. Hent alle filer fra og med den dato.
#  - Åbn filerne og kør SQL-queries fra ovenstående dato og frem til i dag.
#  - ????
#  - Profit!

server = 'tcp:sdacms.database.windows.net'
database = 'events'
username = 'sdaadmin@sdacms'
password = os.environ['SQL_PASSWORD']
cnxn = pyodbc.connect('DRIVER={ODBC Driver 17 for SQL Server};SERVER='+server+';DATABASE='+database+';UID='+username+';PWD='+ password)

def insertSQL(sql):
    cursor = cnxn.cursor()
    cursor.execute(sql)
    cursor.commit()
    print("Ran SQL: %s" % sql)

def getInterestingDates(table):
    # Get last date from SQL server
    cursor = cnxn.cursor()
    cursor.execute("SELECT TOP 1 date FROM %s ORDER BY date DESC;" % table)
    row = cursor.fetchone()
    date = row[0]
    # date = datetime.strptime("2018-06-12", "%Y-%m-%d").date()
    date += timedelta(days=1) # We're not interested in the latest known date from the database, increment one

    now = datetime.now().date()
    # Iterate from then to now
    result = []
    while date <= now:
        result.append(str(date))
        date += timedelta(days=1)

    return result

def get_months(dates):
    months = set()
    for d in dates:
        months.add(d.replace("-", "")[:-2])
    return list(months)

def string_contains_either_term(string, terms):
    checks = map(lambda term: term in string, terms)
    return reduce(lambda x, y: x or y, checks, False)

def getFileNames(interesing_months, name_filter):
    # TODO: Replace url below to match current site id
    out = check_output(["./gsutil/gsutil", "ls", "gs://pubsite_prod_rev_07526863312675431662/stats/installs/installs_dk.maternity.safedelivery_*.csv"])
    files = filter(lambda name: name_filter in name, out.split('\n'))
    return filter(lambda file: string_contains_either_term(file, interesing_months), files)

def download_files(files):
    for file in files:
        call(["./gsutil/gsutil", "-m", "cp", file, "."])

def convert_gs_name_to_local_name(gs_files):
    return map(lambda f: f.split("/").pop(), gs_files)

def run_queries(file, interesting_dates, sql_lambda):
    f = io.open(file, 'r', encoding='utf-16')
    next(f) # Skip one line: headers
    lines = f.readlines()
    for line in lines:
        parts = line.split(',')
        if len(parts) != 13:
            continue
        if parts[2].strip() == "":
            continue

        if parts[0] in interesting_dates:
            parts = map(lambda p: p.strip(), parts)
            sql = sql_lambda(parts)
            insertSQL(sql)

configs = {
    'app_version': {
        'table': "dbo.PlayStoreAppVersion",
        'name_filter': "app_version",
        'sql_lambda': lambda parts: u"INSERT INTO dbo.PlayStoreAppVersion VALUES ('{}','{}',{},{},{},{},{},{},{},{},{},{},{});".format(*parts)
    },
    'os_version': {
        'table': "dbo.PlayStoreOsVersion",
        'name_filter': "os_version",
        'sql_lambda': lambda parts: u"INSERT INTO dbo.PlayStoreOsVersion VALUES ('{}','{}','{}',{},{},{},{},{},{},{},{},{},{});".format(*parts)
    },
    'country': {
        'table': "dbo.PlayStoreCountry",
        'name_filter': "country",
        'sql_lambda': lambda parts: u"INSERT INTO dbo.PlayStoreCountry VALUES ('{}','{}','{}',{},{},{},{},{},{},{},{},{},{});".format(*parts)
    },
}

def handleTable(config):
    interesting_dates = getInterestingDates(config['table'])
    interesting_months = get_months(interesting_dates)

    files_to_download = getFileNames(interesting_months, config['name_filter'])
    download_files(files_to_download) # Synchronous, e.g. wait!

    local_files = convert_gs_name_to_local_name(files_to_download)
    for file in local_files:
        run_queries(file, interesting_dates, config['sql_lambda'])

def main():
    handleTable(configs['app_version'])
    handleTable(configs['os_version'])
    handleTable(configs['country'])


if __name__ == "__main__":
    main()

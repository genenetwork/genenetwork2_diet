import utilities

def get_geno(inbredsetid, name):
    cursor = utilities.get_cursor()
    sql = """
        SELECT Geno.`Id`, Geno.`Name`, Geno.`Chr`, Geno.`Mb`
        FROM (Geno, InbredSet)
        WHERE Geno.`SpeciesId`=InbredSet.`SpeciesId`
        AND InbredSet.`Id`=%s
        AND Geno.`Name` LIKE %s
        """
    cursor.execute(sql, (inbredsetid, name))
    return cursor.fetchone()

def load_genos(file):
    genotypes = []
    file_geno = open(file, 'r')
    for line in file_geno:
        line = line.strip()
        if line.startswith('#'):
            continue
        if line.startswith('@'):
            continue
        cells = line.split()
        if line.startswith("Chr"):
            strains = cells[4:]
            continue
        genotype = {}
        genotype['chr'] = cells[0]
        genotype['locus'] = cells[1]
        genotype['cm'] = cells[2]
        genotype['mb'] = cells[3]
        genotype['values'] = cells[4:]
        genotypes.append(genotype)
    return strains, genotypes
    
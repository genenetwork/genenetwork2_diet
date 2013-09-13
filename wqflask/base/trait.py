from __future__ import absolute_import, division, print_function

import string
import resource


from htmlgen import HTMLgen2 as HT

from base import webqtlConfig
from base.webqtlCaseData import webqtlCaseData
from base.data_set import create_dataset
from dbFunction import webqtlDatabaseFunction
from utility import webqtlUtil

from MySQLdb import escape_string as escape
from pprint import pformat as pf

from flask import Flask, g

def print_mem(stage=""):
    mem = resource.getrusage(resource.RUSAGE_SELF).ru_maxrss
    print("{}: {}".format(stage, mem/1024))

class GeneralTrait(object):
    """
    Trait class defines a trait in webqtl, can be either Microarray,
    Published phenotype, genotype, or user input trait

    """

    def __init__(self, get_qtl_info=False, **kw):
        # xor assertion
        assert bool(kw.get('dataset')) != bool(kw.get('dataset_name')), "Needs dataset ob. or name";
        if kw.get('dataset_name'):
            self.dataset = create_dataset(kw.get('dataset_name'))
        else:
            self.dataset = kw.get('dataset')
        self.name = kw.get('name')                 # Trait ID, ProbeSet ID, Published ID, etc.
        self.cellid = kw.get('cellid')
        self.identification = kw.get('identification', 'un-named trait')
        self.haveinfo = kw.get('haveinfo', False)
        self.sequence = kw.get('sequence')         # Blat sequence, available for ProbeSet
        self.data = kw.get('data', {})
        
        # Sets defaultst
        self.locus = None
        self.lrs = None
        self.pvalue = None
        self.mean = None
        self.num_overlap = None
        

        if kw.get('fullname'):
            name2 = value.split("::")
            if len(name2) == 2:
                self.dataset, self.name = name2
                # self.cellid is set to None above
            elif len(name2) == 3:
                self.dataset, self.name, self.cellid = name2
        
        # Todo: These two lines are necessary most of the time, but perhaps not all of the time
        # So we could add a simple if statement to short-circuit this if necessary
        self.retrieve_info(get_qtl_info=get_qtl_info)
        self.retrieve_sample_data()
        


    def get_name(self):
        stringy = ""
        if self.dataset and self.name:
            stringy = "%s::%s" % (self.dataset, self.name)
            if self.cellid:
                stringy += "::" + self.cellid
        else:
            stringy = self.description
        return stringy


    def get_given_name(self):
        """    
         when user enter a trait or GN generate a trait, user want show the name
         not the name that generated by GN randomly, the two follow function are
         used to give the real name and the database. displayName() will show the
         database also, getGivenName() just show the name.
         For other trait, displayName() as same as getName(), getGivenName() as
         same as self.name
        
         Hongqiang 11/29/07
         
        """
        stringy = self.name
        if self.dataset and self.name:
            desc = self.dataset.get_desc()  
            if desc:
                #desc = self.handle_pca(desc)
                stringy = desc
        return stringy



    def display_name(self):
        stringy = ""
        if self.dataset and self.name:
            desc = self.dataset.get_desc()
            #desc = self.handle_pca(desc)
            if desc:
                #desc = self.handle_pca(desc)
                #stringy = desc
                #if desc.__contains__('PCA'):
                #    desc = desc[desc.rindex(':')+1:].strip()
                #else:
                #    desc = desc[:desc.index('entered')].strip()
                #desc = self.handle_pca(desc)
                stringy = "%s::%s" % (self.dataset, desc)
            else:
                stringy = "%s::%s" % (self.dataset, self.name)
                if self.cellid:
                    stringy += "::" + self.cellid
        else:
            stringy = self.description

        return stringy


    #def __str__(self):
    #       #return "%s %s" % (self.getName(), self.group)
    #       return self.getName()
    #__str__ = getName
    #__repr__ = __str__

    def export_data(self, samplelist, the_type="val"):
        """
        export data according to samplelist
        mostly used in calculating correlation
        
        """
        result = []
        for sample in samplelist:
            if self.data.has_key(sample):
                if the_type=='val':
                    result.append(self.data[sample].val)
                elif the_type=='var':
                    result.append(self.data[sample].var)
                elif the_type=='N':
                    result.append(self.data[sample].N)
                else:
                    raise KeyError, `the_type`+' the_type is incorrect.'
            else:
                result.append(None)
        return result

    def export_informative(self, incVar=0):
        """
        export informative sample
        mostly used in qtl regression
        
        """
        samples = []
        vals = []
        the_vars = []
        for sample, value in self.data.items():
            if value.val != None:
                if not incVar or value.var != None:
                    samples.append(sample)
                    vals.append(value.val)
                    the_vars.append(value.var)
        return  samples, vals, the_vars


    #
    # In ProbeSet, there are maybe several annotations match one sequence
    # so we need use sequence(BlatSeq) as the identification, when we update
    # one annotation, we update the others who match the sequence also.
    #
    # Hongqiang Li, 3/3/2008
    #
    #def getSequence(self):
    #    assert self.cursor
    #    if self.dataset.type == 'ProbeSet':
    #        self.cursor.execute('''
    #                        SELECT
    #                                ProbeSet.BlatSeq
    #                        FROM
    #                                ProbeSet, ProbeSetFreeze, ProbeSetXRef
    #                        WHERE
    #                                ProbeSet.Id=ProbeSetXRef.ProbeSetId and
    #                                ProbeSetFreeze.Id = ProbeSetXRef.ProbSetFreezeId and
    #                                ProbeSet.Name = %s
    #                                ProbeSetFreeze.Name = %s
    #                ''', self.name, self.dataset.name)
    #        #self.cursor.execute(query)
    #        results = self.fetchone()
    #
    #        return results[0]



    def retrieve_sample_data(self, samplelist=None):
        if samplelist == None:
            samplelist = []
            
        #assert self.dataset
        
        #if self.cellid:
        #     #Probe Data
        #    query = '''
        #            SELECT
        #                    Strain.Name, ProbeData.value, ProbeSE.error, ProbeData.Id
        #            FROM
        #                    (ProbeData, ProbeFreeze, ProbeSetFreeze, ProbeXRef,
        #                    Strain, Probe, ProbeSet)
        #            left join ProbeSE on
        #                    (ProbeSE.DataId = ProbeData.Id AND ProbeSE.StrainId = ProbeData.StrainId)
        #            WHERE
        #                    Probe.Name = '%s' AND ProbeSet.Name = '%s' AND
        #                    Probe.ProbeSetId = ProbeSet.Id AND
        #                    ProbeXRef.ProbeId = Probe.Id AND
        #                    ProbeXRef.ProbeFreezeId = ProbeFreeze.Id AND
        #                    ProbeSetFreeze.ProbeFreezeId = ProbeFreeze.Id AND
        #                    ProbeSetFreeze.Name = '%s' AND
        #                    ProbeXRef.DataId = ProbeData.Id AND
        #                    ProbeData.StrainId = Strain.Id
        #            Order BY
        #                    Strain.Name
        #            ''' % (self.cellid, self.name, self.dataset.name)
        #            
        #else:
        results = self.dataset.retrieve_sample_data(self.name)

        # Todo: is this necessary? If not remove
        self.data.clear()

        if results:
            for item in results:
                #name, value, variance, num_cases = item
                if not samplelist or (samplelist and name in samplelist):
                    name = item[0]
                    self.data[name] = webqtlCaseData(*item)   #name, value, variance, num_cases)

    #def keys(self):
    #    return self.__dict__.keys()
    #
    #def has_key(self, key):
    #    return self.__dict__.has_key(key)
    #
    #def items(self):
    #    return self.__dict__.items()

    def retrieve_info(self, get_qtl_info=False):
        assert self.dataset, "Dataset doesn't exist"
        if self.dataset.type == 'Publish':
            query = """
                    SELECT
                            PublishXRef.Id, Publication.PubMed_ID,
                            Phenotype.Pre_publication_description, Phenotype.Post_publication_description, Phenotype.Original_description,
                            Phenotype.Pre_publication_abbreviation, Phenotype.Post_publication_abbreviation,
                            Phenotype.Lab_code, Phenotype.Submitter, Phenotype.Owner, Phenotype.Authorized_Users,
                            Publication.Authors, Publication.Title, Publication.Abstract,
                            Publication.Journal, Publication.Volume, Publication.Pages,
                            Publication.Month, Publication.Year, PublishXRef.Sequence,
                            Phenotype.Units, PublishXRef.comments
                    FROM
                            PublishXRef, Publication, Phenotype, PublishFreeze
                    WHERE
                            PublishXRef.Id = %s AND
                            Phenotype.Id = PublishXRef.PhenotypeId AND
                            Publication.Id = PublishXRef.PublicationId AND
                            PublishXRef.InbredSetId = PublishFreeze.InbredSetId AND
                            PublishFreeze.Id = %s
                    """ % (self.name, self.dataset.id)
            trait_info = g.db.execute(query).fetchone()
        #XZ, 05/08/2009: Xiaodong add this block to use ProbeSet.Id to find the probeset instead of just using ProbeSet.Name
        #XZ, 05/08/2009: to avoid the problem of same probeset name from different platforms.
        elif self.dataset.type == 'ProbeSet':
            display_fields_string = ', ProbeSet.'.join(self.dataset.display_fields)
            display_fields_string = 'ProbeSet.' + display_fields_string
            query = """
                    SELECT %s
                    FROM ProbeSet, ProbeSetFreeze, ProbeSetXRef
                    WHERE
                            ProbeSetXRef.ProbeSetFreezeId = ProbeSetFreeze.Id AND
                            ProbeSetXRef.ProbeSetId = ProbeSet.Id AND
                            ProbeSetFreeze.Name = '%s' AND
                            ProbeSet.Name = '%s'
                    """ % (escape(display_fields_string),
                           escape(self.dataset.name),
                           escape(self.name))
            trait_info = g.db.execute(query).fetchone()
        #XZ, 05/08/2009: We also should use Geno.Id to find marker instead of just using Geno.Name
        # to avoid the problem of same marker name from different species.
        elif self.dataset.type == 'Geno':
            display_fields_string = string.join(self.dataset.display_fields,',Geno.')
            display_fields_string = 'Geno.' + display_fields_string
            query = """
                    SELECT %s
                    FROM Geno, GenoFreeze, GenoXRef
                    WHERE
                            GenoXRef.GenoFreezeId = GenoFreeze.Id AND
                            GenoXRef.GenoId = Geno.Id AND
                            GenoFreeze.Name = '%s' AND
                            Geno.Name = '%s'
                    """ % (escape(display_fields_string),
                           escape(self.dataset.name),
                           escape(self.name))
            trait_info = g.db.execute(query).fetchone()
            #print("trait_info is: ", pf(trait_info))
        else: #Temp type
            query = """SELECT %s FROM %s WHERE Name = %s
                                     """ % (string.join(self.dataset.display_fields,','),
                                            self.dataset.type, self.name)
            trait_info = g.db.execute(query).fetchone()


        #self.cursor.execute(query)
        #trait_info = self.cursor.fetchone()
        if trait_info:
            self.haveinfo = True

            #XZ: assign SQL query result to trait attributes.
            for i, field in enumerate(self.dataset.display_fields):
                #print("  mike: {} -> {} - {}".format(field, type(trait_info[i]), trait_info[i]))
                holder = trait_info[i]
                if isinstance(trait_info[i], basestring):
                    holder = unicode(trait_info[i], "utf8", "ignore")
                setattr(self, field, holder)

            if self.dataset.type == 'Publish':
                self.confidential = 0
                if self.pre_publication_description and not self.pubmed_id:
                    self.confidential = 1

            self.homologeneid = None
            
            #print("self.geneid is:", self.geneid)
            #print("  type:", type(self.geneid))
            #print("self.dataset.group.name is:", self.dataset.group.name)
            if self.dataset.type == 'ProbeSet' and self.dataset.group and self.geneid:
                #XZ, 05/26/2010: From time to time, this query get error message because some geneid values in database are not number.
                #XZ: So I have to test if geneid is number before execute the query.
                #XZ: The geneid values in database should be cleaned up.
                #try:
                #    float(self.geneid)
                #    geneidIsNumber = True
                #except ValueError:
                #    geneidIsNumber = False

                #if geneidIsNumber:


                query = """
                        SELECT
                                HomologeneId
                        FROM
                                Homologene, Species, InbredSet
                        WHERE
                                Homologene.GeneId =%s AND
                                InbredSet.Name = '%s' AND
                                InbredSet.SpeciesId = Species.Id AND
                                Species.TaxonomyId = Homologene.TaxonomyId
                        """ % (escape(str(self.geneid)), escape(self.dataset.group.name))
                result = g.db.execute(query).fetchone()
                #else:
                #    result = None

                if result:
                    self.homologeneid = result[0]

            if get_qtl_info:
                if self.dataset.type == 'ProbeSet' and not self.cellid:
                    query = """
                            SELECT
                                    ProbeSetXRef.Locus, ProbeSetXRef.LRS, ProbeSetXRef.pValue, ProbeSetXRef.mean
                            FROM
                                    ProbeSetXRef, ProbeSet
                            WHERE
                                    ProbeSetXRef.ProbeSetId = ProbeSet.Id AND
                                    ProbeSet.Name = "{}" AND
                                    ProbeSetXRef.ProbeSetFreezeId ={}
                            """.format(self.name, self.dataset.id)
                    trait_qtl = g.db.execute(query).fetchone()
                    #self.cursor.execute(query)
                    #trait_qtl = self.cursor.fetchone()
                    if trait_qtl:
                        self.locus, self.lrs, self.pvalue, self.mean = trait_qtl
                        if self.locus:
                            query = """
                                select Geno.Chr, Geno.Mb from Geno, Species
                                where Species.Name = '{}' and
                                Geno.Name = '{}' and
                                Geno.SpeciesId = Species.Id
                                """.format(self.dataset.group.species, self.locus)
                            result = g.db.execute(query).fetchone()
                            self.locus_chr = result[0]
                            self.locus_mb = result[1]
                    else:
                        self.locus = self.locus_chr = self.locus_mb = self.lrs = self.pvalue = self.mean = ""
                
                
                if self.dataset.type == 'Publish':
                    trait_qtl = g.db.execute("""
                            SELECT
                                    PublishXRef.Locus, PublishXRef.LRS
                            FROM
                                    PublishXRef, PublishFreeze
                            WHERE
                                    PublishXRef.Id = %s AND
                                    PublishXRef.InbredSetId = PublishFreeze.InbredSetId AND
                                    PublishFreeze.Id =%s
                            """, (self.name, self.dataset.id)).fetchone()
                    #self.cursor.execute(query)
                    #trait_qtl = self.cursor.fetchone()
                    if trait_qtl:
                        self.locus, self.lrs = trait_qtl
                    else:
                        self.locus = self.lrs = ""
        else:
            raise KeyError, `self.name`+' information is not found in the database.'

    def genHTML(self, formName = "", dispFromDatabase=0, privilege="guest", userName="Guest", authorized_users=""):
        if not self.haveinfo:
            self.retrieveInfo()

        if self.dataset.type == 'Publish':
            PubMedLink = ""
            if self.pubmed_id:
                PubMedLink = HT.Href(text="PubMed %d : " % self.pubmed_id,
                target = "_blank", url = webqtlConfig.PUBMEDLINK_URL % self.pubmed_id)
            else:
                PubMedLink = HT.Span("Unpublished : ", Class="fs15")

            if formName:
                setDescription2 = HT.Href(url="javascript:showDatabase3('%s','%s','%s','')" %
                (formName, self.dataset.name, self.name), Class = "fs14")
            else:
                setDescription2 = HT.Href(url="javascript:showDatabase2('%s','%s','')" %
                (self.dataset.name,self.name), Class = "fs14")

            if self.confidential and not webqtlUtil.hasAccessToConfidentialPhenotypeTrait(privilege=privilege, userName=userName, authorized_users=authorized_users):
                setDescription2.append('RecordID/%s - %s' % (self.name, self.pre_publication_description))
            else:
                setDescription2.append('RecordID/%s - %s' % (self.name, self.post_publication_description))

            #XZ 03/26/2011: Xiaodong comment out the following two lins as Rob asked. Need to check with Rob why in PublishXRef table, there are few row whose Sequence > 1.
            #if self.sequence > 1:
            #       setDescription2.append(' btach %d' % self.sequence)
            if self.authors:
                a1 = string.split(self.authors,',')[0]
                while a1[0] == '"' or a1[0] == "'" :
                    a1 = a1[1:]
                setDescription2.append(' by ')
                setDescription2.append(HT.Italic('%s, and colleagues' % a1))
            setDescription = HT.Span(PubMedLink, setDescription2)

        elif self.dataset.type == 'Temp':
            setDescription = HT.Href(text="%s" % (self.description),url="javascript:showDatabase2\
            ('%s','%s','')" % (self.dataset.name,self.name), Class = "fs14")
            setDescription = HT.Span(setDescription)

        elif self.dataset.type == 'Geno': # Genome DB only available for single search
            if formName:
                setDescription = HT.Href(text="Locus %s [Chr %s @ %s Mb]" % (self.name,self.chr,\
        '%2.3f' % self.mb),url="javascript:showDatabase3('%s','%s','%s','')" % \
        (formName, self.dataset.name, self.name), Class = "fs14")
            else:
                setDescription = HT.Href(text="Locus %s [Chr %s @ %s Mb]" % (self.name,self.chr,\
        '%2.3f' % self.mb),url="javascript:showDatabase2('%s','%s','')" % \
        (self.dataset.name,self.name), Class = "fs14")

            setDescription = HT.Span(setDescription)

        else:
            if self.cellid:
                if formName:
                    setDescription = HT.Href(text="ProbeSet/%s/%s" % (self.name, self.cellid),url=\
            "javascript:showDatabase3('%s','%s','%s','%s')" % (formName, self.dataset.name,self.name,self.cellid), \
            Class = "fs14")
                else:
                    setDescription = HT.Href(text="ProbeSet/%s/%s" % (self.name,self.cellid),url=\
            "javascript:showDatabase2('%s','%s','%s')" % (self.dataset.name,self.name,self.cellid), \
            Class = "fs14")
            else:
                if formName:
                    setDescription = HT.Href(text="ProbeSet/%s" % self.name, url=\
            "javascript:showDatabase3('%s','%s','%s','')" % (formName, self.dataset.name,self.name), \
            Class = "fs14")
                else:
                    setDescription = HT.Href(text="ProbeSet/%s" % self.name, url=\
            "javascript:showDatabase2('%s','%s','')" % (self.dataset.name,self.name), \
            Class = "fs14")
            if self.symbol and self.chr and self.mb:
                setDescription.append(' [')
                setDescription.append(HT.Italic('%s' % self.symbol,Class="cdg fwb"))
                setDescription.append(' on Chr %s @ %s Mb]' % (self.chr,self.mb))
            if self.description:
                setDescription.append(': %s' % self.description)
            if self.probe_target_description:
                setDescription.append('; %s' % self.probe_target_description)
            setDescription = HT.Span(setDescription)

        if self.dataset.type != 'Temp' and dispFromDatabase:
            setDescription.append( ' --- FROM : ')
            setDescription.append(self.dataset.genHTML(Class='cori'))
        return setDescription

    @property
    def description_fmt(self):
        '''Return a text formated description'''
        if self.description:
            formatted = self.description
            if self.probe_target_description:
                formatted += "; " + self.probe_target_description
        else:
            formatted = "Not available"
        return formatted.capitalize()

    @property
    def alias_fmt(self):
        '''Return a text formatted alias'''
        if self.alias:
            alias = string.replace(self.alias, ";", " ")
            alias = string.join(string.split(alias), ", ")
        return alias


    @property
    def location_fmt(self):
        '''Return a text formatted location

        While we're at it we set self.location in case we need it later (do we?)

        '''

        if self.chr and self.mb:
            self.location = 'Chr %s @ %s Mb'  % (self.chr,self.mb)
        elif self.chr:
            self.location = 'Chr %s @ Unknown position' % (self.chr)
        else:
            self.location = 'Not available'

        fmt = self.location
        ##XZ: deal with direction
        if self.strand_probe == '+':
            fmt += (' on the plus strand ')
        elif self.strand_probe == '-':
            fmt += (' on the minus strand ')

        return fmt


    def get_database(self):
        """
        Returns the database, and the url referring to the database if it exists

        We're going to to return two values here, and we don't want to have to call this twice from
        the template. So it's not a property called from the template, but instead is called from the view

        """
        if self.cellid:
            self.cursor.execute("""
                            select ProbeFreeze.Name from ProbeFreeze, ProbeSetFreeze
                                    where
                            ProbeFreeze.Id = ProbeSetFreeze.ProbeFreezeId AND
                            ProbeSetFreeze.Id = %d""" % thisTrait.dataset.id)
            probeDBName = self.cursor.fetchone()[0]
            return dict(name = probeDBName,
                        url = None)
        else:
            return dict(name = self.dataset.fullname,
                        url = webqtlConfig.INFOPAGEHREF % self.dataset.name)

    def calculate_correlation(self, values, method):
        """Calculate the correlation value and p value according to the method specified"""

        #ZS: This takes the list of values of the trait our selected trait is being correlated against and removes the values of the samples our trait has no value for
        #There's probably a better way of dealing with this, but I'll have to ask Christian
        updated_raw_values = []
        updated_values = []
        for i in range(len(values)):
            if values[i] != "None":
                updated_raw_values.append(self.raw_values[i])
                updated_values.append(values[i])

        self.raw_values = updated_raw_values
        values = updated_values

        if method == METHOD_SAMPLE_PEARSON or method == METHOD_LIT or method == METHOD_TISSUE_PEARSON:
            corr, nOverlap = webqtlUtil.calCorrelation(self.raw_values, values, len(values))
        else:
            corr, nOverlap = webqtlUtil.calCorrelationRank(self.raw_values, values, len(values))

        self.correlation = corr
        self.overlap = nOverlap

        if self.overlap < 3:
            self.p_value = 1.0
        else:
            #ZS - This is probably the wrong way to deal with this. Correlation values of 1.0 definitely exist (the trait correlated against itself), so zero division needs to br prevented.
            if abs(self.correlation) >= 1.0:
                self.p_value = 0.0
            else:
                ZValue = 0.5*log((1.0+self.correlation)/(1.0-self.correlation))
                ZValue = ZValue*sqrt(self.overlap-3)
                self.p_value = 2.0*(1.0 - reaper.normp(abs(ZValue)))

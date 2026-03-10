<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
    <xsl:output method="xml" indent="yes" encoding="UTF-8"/>

    <xsl:variable name="key" select="'__KLAVESA__'"/>

    <xsl:template match="/">
        <xsl:apply-templates select="player"/>
    </xsl:template>

    <xsl:template match="player">
        <!-- Reconstruct player node -->
        <player>
            <!-- Copy attributes like name -->
            <xsl:for-each select="@*">
                <xsl:attribute name="{name()}">
                    <xsl:value-of select="."/>
                </xsl:attribute>
            </xsl:for-each>
            
            <!-- Process children -->
            <xsl:apply-templates select="position"/>
            
            <!-- Copy everything else unchanged -->
            <xsl:copy-of select="inventory"/>
            <xsl:copy-of select="stats"/>
        </player>
    </xsl:template>

    <xsl:template match="position">
        <position>
            <x>
                <xsl:choose>
                    <xsl:when test="$key = 'a'">
                        <xsl:value-of select="number(x) - 1"/>
                    </xsl:when>
                    <xsl:when test="$key = 'd'">
                        <xsl:value-of select="number(x) + 1"/>
                    </xsl:when>
                    <xsl:otherwise>
                        <xsl:value-of select="x"/>
                    </xsl:otherwise>
                </xsl:choose>
            </x>
            <y>
                <xsl:choose>
                    <xsl:when test="$key = 'w'">
                        <xsl:value-of select="number(y) - 1"/>
                    </xsl:when>
                    <xsl:when test="$key = 's'">
                        <xsl:value-of select="number(y) + 1"/>
                    </xsl:when>
                    <xsl:otherwise>
                        <xsl:value-of select="y"/>
                    </xsl:otherwise>
                </xsl:choose>
            </y>
        </position>
    </xsl:template>

</xsl:stylesheet>
